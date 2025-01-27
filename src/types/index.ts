export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'instructor';
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
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
  course_details: {
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
  };
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