/*
  # Add RLS policies for user_courses table
  
  The user_courses table was created without RLS policies, causing
  insert operations to fail with row-level security violations.
  
  This migration enables RLS and adds policies to allow users to:
  - Insert their own course purchase records
  - Read their own course purchase records
  - Allow instructors to see who purchased their courses
*/

-- Enable RLS on user_courses table
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own course purchase records
CREATE POLICY "Users can insert their own course purchases"
  ON user_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to read their own course purchase records
CREATE POLICY "Users can read their own course purchases"
  ON user_courses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    -- Allow instructors to see who purchased their courses
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id
      AND instructor_id = auth.uid()
    )
  );

-- Policy to allow users to update their own course purchase records (if needed)
CREATE POLICY "Users can update their own course purchases"
  ON user_courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own course purchase records (if needed)
CREATE POLICY "Users can delete their own course purchases"
  ON user_courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
