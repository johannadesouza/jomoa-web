-- ============================================================================
-- User DB: Storage bucket + RLS för progress-photos
-- Kör i USER DB (jfilxiqtecaxbwdsztaz) SQL Editor
-- ============================================================================

-- Skapa bucket (om den inte finns – gör detta i Supabase Dashboard → Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('progress-photos', 'progress-photos', false)
-- ON CONFLICT (id) DO NOTHING;

-- RLS: användare kan bara se/ladda upp/ta bort sina egna bilder
-- Bildsökvägar: {client_id}/{filename}

CREATE POLICY "progress_photos_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "progress_photos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "progress_photos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
