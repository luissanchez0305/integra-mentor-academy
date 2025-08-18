export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'instructor';
  avatar_url: string,
  courses: [],
  students: number,
}

export interface Course {
  id: string;
  title: string;
  instructor: User;
  instructor_id: string;
  description: string;
  price: number;
  sale_price: number;
  intro_video_url: string;
  has_certificate: boolean;
  is_lifetime_access: boolean;
  access_duration: number;
  difficulty: string;
  updated_at: string;
  is_published: boolean;
  questions: [{
    user: User,
    question_text: string,
    answer_text: string,
    created_at: string,
  }],
  notes: [{
    note_text: string,
    video_time: string,
    created_at: string,
  }],
  course_details: [{
    what_will_learn: string[];
    requirements: string[];
    includes: {
      video_hours: number;
      downloadable_resources: number;
      articles: number;
      coding_exercises: number;
      homework: number;
      devices: string[];
      languages: string[];
      access: string;
    };
  }];
  rating: number;
  reviews: number;
  thumbnail: string;
  duration: number;
  lessons: number;
  category: string;
}

export interface CartItem {
  course: Course;
  quantity: number;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  position: number;
  course_lessons: CourseLesson[];
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  video_url: string;
  position: number;
  duration: string;
  created_at: string;
  updated_at: string;
  progress?: LessonProgress;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
  total_duration_seconds: number;
  completion_percentage: number;
  last_accessed: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  last_accessed: string;
  total_watch_time_seconds: number;
}