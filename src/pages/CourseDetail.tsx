import React from 'react';
import { Star, Users, Calendar, Play, Download, FileText, Monitor, Award, ChevronRight, Clock, Globe } from 'lucide-react';

// Mock data - Replace with actual data from your API
const courseData = {
  id: '1',
  title: 'Complete Web Development Bootcamp 2024',
  rating: 4.8,
  totalStudents: 125890,
  lastUpdated: '2024-02-15',
  instructor: 'John Doe',
  description: `Master web development from the ground up with this comprehensive bootcamp. This course takes you from absolute beginner to professional developer, covering everything you need to know to build modern, responsive websites and web applications.

  You'll learn HTML5, CSS3, JavaScript, React, Node.js, and more through hands-on projects and real-world examples. Our project-based approach ensures you're not just learning theory, but actually building professional-quality websites and applications that you can add to your portfolio.

  Whether you're looking to start a career in web development, freelance, or build your own projects, this course provides all the tools and knowledge you need to succeed in the modern web development landscape.`,
  previewVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  difficulty: 'Intermediate',
  languages: ['English', 'Spanish', 'French'],
  learningObjectives: [
    'Build 16+ professional websites and web applications from scratch',
    'Master modern JavaScript including ES6+ features and best practices',
    'Learn React.js and build single-page applications',
    'Understand responsive design principles and mobile-first development',
    'Implement user authentication and database integration',
    'Deploy applications using modern cloud platforms'
  ],
  courseIncludes: {
    videoHours: 52,
    downloadableResources: 85,
    articles: 26,
    access: 'Lifetime',
    devices: ['Desktop', 'Mobile', 'TV'],
    certificate: true
  },
  prerequisites: [
    'Basic computer skills and familiarity with web browsers',
    'No prior programming experience required',
    'A computer with internet access (Windows, Mac, or Linux)',
    'Text editor (VS Code recommended, free download)'
  ],
  price: 94.99,
  discountPrice: 84.99
};

export default function CourseDetail() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Course Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(courseData.rating)}
                  <span className="ml-2 font-medium">{courseData.rating}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{courseData.totalStudents.toLocaleString()} students</span>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Created by <span className="text-blue-400">{courseData.instructor}</span>
              </p>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last updated {new Date(courseData.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src={courseData.previewVideo}
                  title="Course Preview"
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <div className="prose max-w-none">
                {courseData.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium">Level: </span>
                  <span className="ml-2 text-gray-600">{courseData.difficulty}</span>
                </div>
                <div>
                  <span className="font-medium">Languages: </span>
                  <span className="text-gray-600">
                    {courseData.languages.join(', ')}
                  </span>
                </div>
              </div>
            </section>

            {/* Learning Objectives */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {courseData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{objective}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Prerequisites */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Requirements</h2>
              <ul className="space-y-3">
                {courseData.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold">${courseData.discountPrice}</span>
                    {courseData.discountPrice < courseData.price && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        ${courseData.price}
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4">
                  Buy Now
                </button>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold mb-4">This course includes:</h3>
                  <div className="flex items-center">
                    <Play className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.courseIncludes.videoHours} hours on-demand video</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.courseIncludes.downloadableResources} downloadable resources</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.courseIncludes.articles} articles</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.courseIncludes.access} access</span>
                  </div>
                  <div className="flex items-center">
                    <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Access on {courseData.courseIncludes.devices.join(', ')}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}