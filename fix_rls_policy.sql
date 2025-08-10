-- QUICK FIX: Run this SQL in your Supabase Dashboard > SQL Editor
-- This adds a policy to allow reading instructor profiles

CREATE POLICY "Users can read instructor profiles for courses"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow reading profiles of users who are instructors of any course
    EXISTS (
      SELECT 1 FROM courses
      WHERE instructor_id = profiles.id
    )
  );
