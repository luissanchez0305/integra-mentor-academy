import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Star } from 'lucide-react';
import { Course } from '../types';

// Mock data for demonstration
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    instructor: 'John Doe',
    description: 'Learn web development from scratch with this comprehensive course',
    price: 99.99,
    rating: 4.8,
    reviews: 1234,
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
    duration: '32 hours',
    lessons: 280,
    category: 'Web Development'
  },
  {
    id: '2',
    title: 'Python for Data Science',
    instructor: 'Jane Smith',
    description: 'Master Python for data analysis and machine learning',
    price: 89.99,
    rating: 4.7,
    reviews: 856,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
    duration: '28 hours',
    lessons: 240,
    category: 'Data Science'
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    instructor: 'Mike Wilson',
    description: 'Learn modern UI/UX design principles and tools',
    price: 79.99,
    rating: 4.9,
    reviews: 567,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    duration: '24 hours',
    lessons: 200,
    category: 'Design'
  },
  // Add more mock courses as needed
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">{mockCourses.length} courses found</p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Price</h3>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="under50">Under $50</option>
                    <option value="50to100">$50 - $100</option>
                    <option value="over100">Over $100</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Rating</h3>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Ratings</option>
                    <option value="4.5">4.5 & Up</option>
                    <option value="4.0">4.0 & Up</option>
                    <option value="3.5">3.5 & Up</option>
                    <option value="3.0">3.0 & Up</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Duration</h3>
                  <div className="space-y-2">
                    {['0-2 Hours', '3-6 Hours', '7-16 Hours', '17+ Hours'].map((duration) => (
                      <label key={duration} className="flex items-center">
                        <input type="checkbox" className="rounded text-blue-600 mr-2" />
                        <span className="text-gray-700">{duration}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {course.rating}
                        </span>
                      </div>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {course.reviews.toLocaleString()} reviews
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${course.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {course.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}