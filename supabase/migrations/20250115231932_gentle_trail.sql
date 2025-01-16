/*
  # Course Management Schema

  1. New Tables
    - `courses`
      - Basic course information
      - Pricing and access details
      - Learning objectives and requirements
    - `course_sections`
      - Organized content sections
    - `course_lessons`
      - Individual video lessons within sections
    
  2. Security
    - Enable RLS on all tables
    - Instructors can manage their own courses
    - Students can read published courses
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  thumbnail_url text,
  is_published boolean DEFAULT false,
  has_certificate boolean DEFAULT false,
  is_lifetime_access boolean DEFAULT true,
  access_duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course details table for additional information
CREATE TABLE IF NOT EXISTS course_details (
  course_id uuid PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  what_will_learn text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  includes jsonb DEFAULT '{
    "video_hours": 0,
    "downloadable_resources": 0,
    "articles": 0,
    "coding_exercises": 0,
    "homework": 0
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course sections table
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, position)
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  video_url text NOT NULL,
  position integer NOT NULL,
  duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section_id, position)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Instructors can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Everyone can view published courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_published = true OR auth.uid() = instructor_id);

-- Policies for course details
CREATE POLICY "Course details follow course access"
  ON course_details
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id
      AND (is_published = true OR instructor_id = auth.uid())
    )
  );

-- Policies for sections
CREATE POLICY "Course sections follow course access"
  ON course_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id
      AND (is_published = true OR instructor_id = auth.uid())
    )
  );

-- Policies for lessons
CREATE POLICY "Course lessons follow course access"
  ON course_lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_sections s
      JOIN courses c ON c.id = s.course_id
      WHERE s.id = section_id
      AND (c.is_published = true OR c.instructor_id = auth.uid())
    )
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_details_updated_at
  BEFORE UPDATE ON course_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();