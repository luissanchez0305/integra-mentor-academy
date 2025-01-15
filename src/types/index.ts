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
  description: string;
  price: number;
  rating: number;
  reviews: number;
  thumbnail: string;
  duration: string;
  lessons: number;
  category: string;
}

export interface CartItem {
  course: Course;
  quantity: number;
}