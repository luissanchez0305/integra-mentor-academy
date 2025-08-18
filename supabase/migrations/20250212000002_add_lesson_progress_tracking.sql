/*
  # Add lesson progress tracking
  
  This migration creates a table to track user progress through course lessons.
  It tracks completion status, watch time, and last accessed for each lesson.
*/

-- Create lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  is_completed boolean DEFAULT false,
  watch_time_seconds integer DEFAULT 0,
  total_duration_seconds integer DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own progress
CREATE POLICY "Users can read their own lesson progress"
  ON lesson_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own progress
CREATE POLICY "Users can insert their own lesson progress"
  ON lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own progress
CREATE POLICY "Users can update their own lesson progress"
  ON lesson_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow instructors to view progress on their courses
CREATE POLICY "Instructors can view progress on their courses"
  ON lesson_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id
      AND instructor_id = auth.uid()
    )
  );

-- Function to automatically update completion status
CREATE OR REPLACE FUNCTION update_lesson_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as completed if watch time is >= 80% of total duration
  IF NEW.total_duration_seconds > 0 AND NEW.watch_time_seconds >= (NEW.total_duration_seconds * 0.8) THEN
    NEW.is_completed = true;
    NEW.completion_percentage = 100;
    NEW.completed_at = now();
  ELSE
    -- Calculate completion percentage
    IF NEW.total_duration_seconds > 0 THEN
      NEW.completion_percentage = ROUND((NEW.watch_time_seconds::numeric / NEW.total_duration_seconds::numeric) * 100, 2);
    END IF;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson completion
CREATE TRIGGER update_lesson_completion_trigger
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_completion();

-- Create trigger for updating timestamps
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
