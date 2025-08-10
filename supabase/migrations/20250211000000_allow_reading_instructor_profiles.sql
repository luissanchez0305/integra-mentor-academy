/*
  # Allow reading instructor profiles for course displays
  
  The current RLS policy on profiles only allows users to read their own profile.
  This prevents course joins from working because users need to read instructor
  profiles when viewing courses.
  
  This migration adds a policy to allow reading profiles of course instructors.
*/

-- Add policy to allow reading instructor profiles when viewing courses
CREATE POLICY "Users can read instructor profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow reading profiles of users who are instructors of published courses
    EXISTS (
      SELECT 1 FROM courses
      WHERE instructor_id = profiles.id
      AND is_published = true
    )
  );
