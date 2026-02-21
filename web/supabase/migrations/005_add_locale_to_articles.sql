-- Migration: Add locale column to articles table
-- This enables multi-language support for articles

-- Add locale column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'articles' 
    AND column_name = 'locale'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN locale TEXT DEFAULT 'sv';
    
    -- Update existing articles to have Swedish locale
    UPDATE public.articles SET locale = 'sv' WHERE locale IS NULL;
    
    -- Make locale NOT NULL after setting defaults
    ALTER TABLE public.articles ALTER COLUMN locale SET NOT NULL;
    
    -- Add constraint to only allow 'sv' or 'en'
    ALTER TABLE public.articles ADD CONSTRAINT articles_locale_check 
      CHECK (locale IN ('sv', 'en'));
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_articles_locale ON public.articles(locale);
    
    RAISE NOTICE 'Added locale column to articles table';
  ELSE
    RAISE NOTICE 'locale column already exists in articles table';
  END IF;
END $$;









