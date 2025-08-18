export interface SpecialCourse {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  sale_price?: number;
  thumbnail_url?: string;
  is_published: boolean;
  has_certificate: boolean;
  total_sections: number;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface SpecialCourseSection {
  id: string;
  course_id: string;
  title: string;
  content: string;
  section_type: 'content' | 'test' | 'certificate';
  lesson_number?: number;
  section_order: number;
  sound_url?: string;
  animation_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SpecialCourseTest {
  id: string;
  course_id: string;
  lesson_number?: number;
  title: string;
  is_final_test: boolean;
  questions: SpecialCourseTestQuestion[];
  created_at: string;
  updated_at: string;
}

export interface SpecialCourseTestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  question_order: number;
  created_at: string;
  updated_at: string;
}

export interface SpecialCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_section: number;
  completed_sections: number[];
  is_completed: boolean;
  completion_percentage: number;
  last_accessed: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SpecialCourseTestResult {
  id: string;
  user_id: string;
  test_id: string;
  course_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers: Record<string, any>;
  passed: boolean;
  completed_at: string;
  created_at: string;
}