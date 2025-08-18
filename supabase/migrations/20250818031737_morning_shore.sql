/*
  # Add Special Courses Support
  
  1. New Tables
    - `special_courses` - For PDF-based interactive courses
    - `special_course_sections` - Individual sections within special courses
    - `special_course_tests` - Tests for each lesson
    - `special_course_test_questions` - Questions for tests
    - `special_course_progress` - User progress through special courses
    - `special_course_test_results` - User test results
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for access control
*/

-- Create special courses table
CREATE TABLE IF NOT EXISTS special_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  slug text UNIQUE NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  thumbnail_url text,
  is_published boolean DEFAULT false,
  has_certificate boolean DEFAULT true,
  total_sections integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create special course sections table
CREATE TABLE IF NOT EXISTS special_course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES special_courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  section_type text NOT NULL DEFAULT 'content', -- 'content', 'test', 'certificate'
  lesson_number integer,
  section_order integer NOT NULL,
  sound_url text,
  animation_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create special course tests table
CREATE TABLE IF NOT EXISTS special_course_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES special_courses(id) ON DELETE CASCADE NOT NULL,
  lesson_number integer,
  title text NOT NULL,
  is_final_test boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create special course test questions table
CREATE TABLE IF NOT EXISTS special_course_test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES special_course_tests(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL, -- Array of answer options
  correct_answer integer NOT NULL, -- Index of correct answer
  explanation text,
  question_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create special course progress table
CREATE TABLE IF NOT EXISTS special_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES special_courses(id) ON DELETE CASCADE NOT NULL,
  current_section integer DEFAULT 1,
  completed_sections integer[] DEFAULT '{}',
  is_completed boolean DEFAULT false,
  completion_percentage numeric(5,2) DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create special course test results table
CREATE TABLE IF NOT EXISTS special_course_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_id uuid REFERENCES special_course_tests(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES special_courses(id) ON DELETE CASCADE NOT NULL,
  score numeric(5,2) NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  answers jsonb NOT NULL, -- User's answers
  passed boolean DEFAULT false,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, test_id)
);

-- Enable RLS on all tables
ALTER TABLE special_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_course_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_course_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_course_test_results ENABLE ROW LEVEL SECURITY;

-- Policies for special_courses
CREATE POLICY "Users can create special courses"
  ON special_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Users can update own special courses"
  ON special_courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Users can view published special courses and their own"
  ON special_courses
  FOR SELECT
  TO authenticated
  USING (is_published = true OR auth.uid() = instructor_id);

-- Policies for special_course_sections
CREATE POLICY "Special course sections follow course access"
  ON special_course_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM special_courses
      WHERE id = course_id
      AND (is_published = true OR instructor_id = auth.uid())
    )
  );

-- Policies for special_course_tests
CREATE POLICY "Special course tests follow course access"
  ON special_course_tests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM special_courses
      WHERE id = course_id
      AND (is_published = true OR instructor_id = auth.uid())
    )
  );

-- Policies for special_course_test_questions
CREATE POLICY "Special course test questions follow test access"
  ON special_course_test_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM special_course_tests t
      JOIN special_courses c ON c.id = t.course_id
      WHERE t.id = test_id
      AND (c.is_published = true OR c.instructor_id = auth.uid())
    )
  );

-- Policies for special_course_progress
CREATE POLICY "Users can read their own special course progress"
  ON special_course_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own special course progress"
  ON special_course_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own special course progress"
  ON special_course_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for special_course_test_results
CREATE POLICY "Users can read their own test results"
  ON special_course_test_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results"
  ON special_course_test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
  ON special_course_test_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_special_courses_updated_at
  BEFORE UPDATE ON special_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_course_sections_updated_at
  BEFORE UPDATE ON special_course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_course_progress_updated_at
  BEFORE UPDATE ON special_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();