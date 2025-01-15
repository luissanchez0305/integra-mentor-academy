import React, { useState } from 'react';
import { User, Camera, Save, Search, BookOpen, Clock, Award, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface UserProfile extends User {
  birthDate: string;
  bio: string;
  location: string;
}

interface CourseHistory extends Course {
  startDate: string;
  endDate?: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
  grade?: number;
}

// Mock data - Replace with actual data from your backend
const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  birthDate: '1990-01-01',
  bio: 'Passionate learner and technology enthusiast',
  location: 'New York, USA'
};

const mockCourseHistory: CourseHistory[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    instructor: 'Jane Smith',
    description: 'Learn web development from scratch',
    price: 99.99,
    rating: 4.8,
    reviews: 1234,
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
    duration: '32 hours',
    lessons: 280,
    category: 'Web Development',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    progress: 100,
    status: 'completed',
    grade: 95
  },
  {
    id: '2',
    title: 'Python for Data Science',
    instructor: 'Mike Wilson',
    description: 'Master Python for data analysis',
    price: 89.99,
    rating: 4.7,
    reviews: 856,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
    duration: '28 hours',
    lessons: 240,
    category: 'Data Science',
    startDate: '2024-02-01',
    progress: 65,
    status: 'in-progress'
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(mockUserProfile);
  const [courses, setCourses] = useState(mockCourseHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to update profile
      setProfile(formData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const filteredCourses = courses
    .filter(course => course.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(course => statusFilter === 'all' || course.status === statusFilter)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="min-h-screen pt-16 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-blue-100">{profile.email}</p>
                <p className="text-blue-100 capitalize">{profile.role}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'personal'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'courses'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Course History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {message && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(profile);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Courses</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="not-started">Not Started</option>
                  </select>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-500">
                      {courses.length === 0
                        ? "You haven't enrolled in any courses yet."
                        : 'No courses match your search criteria.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex flex-col sm:flex-row gap-6 bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full sm:w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                course.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : course.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {course.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{course.instructor}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Started
                              </span>
                              <span className="font-medium">
                                {new Date(course.startDate).toLocaleDateString()}
                              </span>
                            </div>
                            {course.endDate && (
                              <div>
                                <span className="text-gray-500 flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Completed
                                </span>
                                <span className="font-medium">
                                  {new Date(course.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500 flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                Progress
                              </span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            {course.grade && (
                              <div>
                                <span className="text-gray-500 flex items-center">
                                  <Award className="h-4 w-4 mr-1" />
                                  Grade
                                </span>
                                <span className="font-medium">{course.grade}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}