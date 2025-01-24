-- Drop existing policy
DROP POLICY IF EXISTS "Instructors can create courses" ON courses;

-- Create new policy that allows any authenticated user to create courses
CREATE POLICY "Users can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update the policy for viewing courses to allow creators to see their own unpublished courses
DROP POLICY IF EXISTS "Everyone can view published courses" ON courses;
CREATE POLICY "Users can view published courses and their own"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true OR instructor_id = auth.uid());

-- Update the policy for updating courses
DROP POLICY IF EXISTS "Instructors can update own courses" ON courses;
CREATE POLICY "Users can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- Add delete policy for courses
CREATE POLICY "Users can delete own courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (instructor_id = auth.uid());

-- Add a new column 'sale_price' to the 'course' table
ALTER TABLE courses
ADD COLUMN sale_price NUMERIC;
ADD COLUMN difficulty TEXT;
