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