import React from 'react';
import CourseCarousel from '../components/CourseCarousel';

const featuredCourses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    instructor: 'John Doe',
    description: 'Learn web development from scratch',
    price: 99.99,
    rating: 4.8,
    reviews: 1234,
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
    duration: '32 hours',
    lessons: 280,
    category: 'Web Development'
  },
  // Add more courses...
];

const testimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Web Developer',
    content: 'This platform completely changed my career path. The courses are well-structured and the instructors are amazing.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
  },
  // Add more testimonials...
];

export default function Landing() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your Future with Expert-Led Courses
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Learn from industry experts and advance your career with our comprehensive online courses
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
              Start Learning Now
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CourseCarousel title="Featured Courses" courses={featuredCourses} />
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}