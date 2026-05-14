-- Extend enrollment SELECT policy to also match by email
-- (covers rows inserted by admin without user_id)
DROP POLICY IF EXISTS "user reads own enrollments" ON workshop_enrollments;

CREATE POLICY "user reads own enrollments"
  ON workshop_enrollments FOR SELECT
  USING (auth.uid() = user_id OR auth.email() = user_email);
