-- Create public storage bucket for certificate templates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  10485760,  -- 10 MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Allow authenticated users to upload/update/delete
CREATE POLICY "Auth upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Auth update certificates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Auth delete certificates" ON storage.objects
  FOR DELETE USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');
