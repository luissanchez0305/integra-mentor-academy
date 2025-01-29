import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Course } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { addToCart } = useCart();
  const { user, purchasedCourses } = useAuth();

  const hasPurchased = purchasedCourses.some(purchasedCourse => purchasedCourse.id === course.id);

  return (
    <Link to={`/course/${course.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">{course.rating}</span>
            </div>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-sm text-gray-600">{course.reviews} reviews</span>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-900">
                ${course.sale_price || course.price}
              </span>
              {course.sale_price && course.sale_price < course.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${course.price}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {course.duration > 0 ? `${course.duration} hours` : ''}
            </span>
          </div>
          {course.instructor_id !== user?.id && !hasPurchased && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart({ course, quantity: 1 });
              }}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}