# 📚 Course Progress Tracking System

## 🔧 Setup Instructions

### 1. Apply Database Migration

Copy and paste this SQL into your Supabase SQL Editor:

```sql
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
```

## 🚀 Features

### ✅ What's Working Now (Even Without Migration)

The system is designed to work gracefully even before applying the migration:

1. **Course Access Validation** - Users can only access purchased courses
2. **My Courses Page** - Shows purchased courses (progress will show 0% until migration)
3. **Course Learning Interface** - Full video player and navigation
4. **Smart Navigation** - Proper routing and access control

### ✅ What Will Work After Migration

1. **Progress Tracking** - Automatic video watch time tracking
2. **Completion Status** - Lessons marked complete at 80% watch time
3. **Progress Indicators** - Visual progress bars and completion badges
4. **Progress Persistence** - Resume where you left off

## 🧪 Testing Instructions

### Before Migration:
1. Log in as a user who has purchased courses
2. Visit `/my-courses` - should show courses with 0% progress
3. Click "Ir al Curso" or "Comenzar" - should access course learning page
4. Navigate between lessons - should work but no progress saved

### After Migration:
1. Watch videos for 10+ seconds - progress should start tracking
2. Return to My Courses - should show actual progress percentages
3. Resume lessons - should start from where you left off
4. Complete 80% of a video - should auto-mark as completed

## 📍 New Routes

- `/my-courses` - Dashboard of purchased courses with progress
- `/course/:id/learn` - Enhanced learning interface with progress tracking
- `/course/:id/watch` - Original course video page (still works)

## 🔍 Troubleshooting

If you see console messages about "lesson_progress table does not exist", that's normal before applying the migration. The system will work without errors and gracefully handle the missing table.

## 🎯 Key Features

- **Smart Access Control**: Only purchased courses accessible
- **Progress Visualization**: Progress bars, completion badges
- **Auto-Completion**: 80% watch time = completed lesson
- **Graceful Degradation**: Works before and after migration
- **Real-time Tracking**: Progress saved every 10 seconds
- **Resume Functionality**: Continue where you left off
