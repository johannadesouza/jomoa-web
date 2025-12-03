-- Migration: Auto-calculate reading_time_minutes for articles
-- This migration creates a function and trigger to automatically calculate
-- reading_time_minutes based on the content field when articles are created or updated.

-- Drop function and trigger if they exist (for idempotency)
DROP TRIGGER IF EXISTS articles_calc_reading_time_trigger ON public.articles;
DROP FUNCTION IF EXISTS public.calc_article_reading_time();

-- Function to calculate reading time in minutes based on word count
-- Assumes average reading speed of 220 words per minute
CREATE OR REPLACE FUNCTION public.calc_article_reading_time()
RETURNS TRIGGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Only calculate if content is not NULL and not empty
  IF NEW.content IS NULL OR TRIM(NEW.content) = '' THEN
    -- Don't update reading_time_minutes if content is empty
    RETURN NEW;
  END IF;

  -- Count words by splitting on whitespace (spaces, tabs, newlines)
  -- This approach splits on any sequence of whitespace characters,
  -- filters out empty strings, and counts the resulting words
  -- This works well with markdown and plain text
  SELECT COALESCE(
    array_length(
      array_remove(
        regexp_split_to_array(
          TRIM(NEW.content),
          E'\\s+'
        ),
        ''
      ),
      1
    ),
    0
  ) INTO word_count;

  -- If word_count is NULL (shouldn't happen, but safety check), set to 0
  IF word_count IS NULL THEN
    word_count := 0;
  END IF;

  -- Calculate reading time: ceil(words / 220.0)
  -- Minimum 1 minute if there's any content
  NEW.reading_time_minutes := GREATEST(1, CEIL(word_count::NUMERIC / 220.0)::INTEGER);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs BEFORE INSERT and BEFORE UPDATE
CREATE TRIGGER articles_calc_reading_time_trigger
  BEFORE INSERT OR UPDATE OF content ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.calc_article_reading_time();

-- Comment on function
COMMENT ON FUNCTION public.calc_article_reading_time() IS 
  'Automatically calculates reading_time_minutes based on word count in content field. Assumes 220 words per minute reading speed.';

