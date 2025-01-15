import React, { useState } from 'react';
import { Play, CheckCircle, MessageCircle, Book, PenTool, FileText, User, Star, Clock } from 'lucide-react';

// Mock data - Replace with actual data from your API
const courseData = {
  id: '1',
  title: 'Complete Web Development Bootcamp',
  currentVideo: {
    title: 'Introduction to HTML',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15:30',
    completed: false
  },
  instructor: {
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    title: 'Senior Web Developer',
    description: 'Full-stack developer with 10+ years of experience in web development and teaching.',
    courses: 12,
    students: 50000,
    rating: 4.8
  },
  modules: [
    {
      title: 'Getting Started',
      lessons: [
        { id: '1', title: 'Course Overview', duration: '5:30', completed: true },
        { id: '2', title: 'Setting Up Your Development Environment', duration: '10:15', completed: true },
        { id: '3', title: 'Introduction to HTML', duration: '15:30', completed: false, current: true },
      ]
    },
    {
      title: 'HTML Fundamentals',
      lessons: [
        { id: '4', title: 'HTML Document Structure', duration: '12:45', completed: false },
        { id: '5', title: 'Working with Text Elements', duration: '18:20', completed: false },
        { id: '6', title: 'Links and Images', duration: '20:10', completed: false },
      ]
    }
  ],
  questions: [
    {
      id: '1',
      user: 'Alice Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      question: 'How do I properly structure nested elements?',
      answer: 'When nesting elements, make sure to maintain proper indentation and closing tags...',
      timestamp: '2 days ago',
      likes: 5
    },
    {
      id: '2',
      user: 'Bob Johnson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      question: 'What\'s the difference between inline and block elements?',
      answer: 'Block elements take up the full width available and create new lines...',
      timestamp: '1 week ago',
      likes: 8
    }
  ],
  resources: [
    { id: '1', title: 'Course Slides', type: 'PDF', size: '2.5 MB' },
    { id: '2', title: 'Source Code', type: 'ZIP', size: '1.8 MB' },
    { id: '3', title: 'Exercise Files', type: 'ZIP', size: '3.2 MB' }
  ]
};

export default function CourseVideo() {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side - Video Player */}
        <div className="flex-1 bg-black">
          <div className="h-full flex flex-col">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={courseData.currentVideo.url}
                title={courseData.currentVideo.title}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-6 bg-white flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{courseData.currentVideo.title}</h1>
              
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'description'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'qa'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Q&A
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'notes'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'resources'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Resources
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'description' && (
                  <div>
                    <div className="flex items-start space-x-4 mb-6">
                      <img
                        src={courseData.instructor.avatar}
                        alt={courseData.instructor.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{courseData.instructor.name}</h3>
                        <p className="text-gray-500">{courseData.instructor.title}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <div className="flex items-center mr-4">
                            <Book className="h-4 w-4 mr-1" />
                            {courseData.instructor.courses} courses
                          </div>
                          <div className="flex items-center mr-4">
                            <User className="h-4 w-4 mr-1" />
                            {courseData.instructor.students.toLocaleString()} students
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {courseData.instructor.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{courseData.instructor.description}</p>
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div className="space-y-6">
                    {courseData.questions.map((question) => (
                      <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={question.avatar}
                            alt={question.user}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{question.user}</h4>
                              <span className="text-sm text-gray-500">{question.timestamp}</span>
                            </div>
                            <p className="mt-1 text-gray-600">{question.question}</p>
                            {question.answer && (
                              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                <p className="text-gray-600">{question.answer}</p>
                              </div>
                            )}
                            <div className="mt-2 flex items-center space-x-4">
                              <button className="text-sm text-gray-500 hover:text-gray-700">
                                Like ({question.likes})
                              </button>
                              <button className="text-sm text-gray-500 hover:text-gray-700">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <textarea
                      placeholder="Take notes for this lesson..."
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <PenTool className="h-4 w-4 mr-2" />
                      Save Notes
                    </button>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    {courseData.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">{resource.title}</h4>
                            <p className="text-sm text-gray-500">{resource.size}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Course Content */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>
            <div className="space-y-4">
              {courseData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex}>
                  <h3 className="font-medium text-gray-900 mb-2">{module.title}</h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        className={`w-full flex items-center p-2 rounded-lg text-left ${
                          lesson.current
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex-1 flex items-center">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <Play className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{lesson.duration}</span>
                      </button>
                    ))}
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