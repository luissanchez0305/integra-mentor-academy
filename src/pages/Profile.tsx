import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Camera, 
  Save, 
  Search, 
  BookOpen, 
  Clock, 
  Award, 
  AlertCircle, 
  Edit, 
  Eye, 
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';
import { courseService } from '../services/courseService';
import { useNavigate } from 'react-router-dom';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

const countryAreaCodes = [
  { code: '+507', country: 'Panama' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' },
  { code: '+52', country: 'Mexico' },
];

export default function Profile() {
  const { user, purchasedCourses, createdCourses } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    async function loadProfile() {
      const userLoggedIn = await courseService.getLoggedInUser();
      console.log('User:', userLoggedIn);
      console.log('Loading profile');
      if (userLoggedIn) {
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userLoggedIn.id)
            .single();

          if (profileError) throw profileError;

          setProfile(data);
          setFormData(data);
        } catch (err) {
          console.error('Error loading profile:', err);
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      } else {
        console.error('User not found');
        navigate('/login');
        return;
      }
    }

    loadProfile();
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData) return;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(formData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);
      const publicUrl = await profileService.uploadAvatar(file, user.id);
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setFormData(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to update profile picture' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await courseService.toggleCoursePublishStatus(courseId, !currentStatus);
      setCreatedCourses(prev =>
        prev.map(course =>
          course.id === courseId
            ? { ...course, is_published: !currentStatus }
            : course
        )
      );
      setMessage({
        type: 'success',
        text: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`
      });
    } catch (err) {
      console.error('Error toggling course publish status:', err);
      setMessage({
        type: 'error',
        text: 'Failed to update course status'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-12 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-16 pb-12 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={handleAvatarClick}
                  className="relative cursor-pointer group"
                >
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-blue-100">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'created'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Created Courses
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrolled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Learning
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
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 flex">
                        <select
                          name="phone_code"
                          disabled={!isEditing}
                          className="rounded-l-md border-r-0 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          value={formData.phone?.split(' ')[0] || '+507'}
                          onChange={(e) => {
                            const number = formData.phone?.split(' ')[1] || '';
                            setFormData(prev => ({
                              ...prev!,
                              phone: `${e.target.value} ${number}`
                            }));
                          }}
                        >
                          {countryAreaCodes.map(({ code, country }) => (
                            <option key={code} value={code}>
                              {code} ({country})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone?.split(' ')[1] || ''}
                          onChange={(e) => {
                            const code = formData.phone?.split(' ')[0] || '+507';
                            setFormData(prev => ({
                              ...prev!,
                              phone: `${code} ${e.target.value}`
                            }));
                          }}
                          disabled={!isEditing}
                          className="flex-1 rounded-r-md border-l-0 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        name="street_address"
                        value={formData.street_address || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
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

            {activeTab === 'created' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Created Courses</h2>
                  <button
                    onClick={() => navigate('/create-course')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create New Course
                  </button>
                </div>
                {loadingCourses ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : createdCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdCourses.map((course) => (
                      <div key={course.id} className="relative">
                        <CourseCard course={course} />
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <button
                            onClick={() => navigate(`/create-course/${course.id}`)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title="Edit course"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(course.id, course.is_published)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title={course.is_published ? 'Unpublish course' : 'Publish course'}
                          >
                            {course.is_published ? (
                              <EyeOff className="h-4 w-4 text-gray-600" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You haven't created any courses yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'enrolled' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Learning</h2>
                {loadingCourses ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : purchasedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Courses
                    </button>
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