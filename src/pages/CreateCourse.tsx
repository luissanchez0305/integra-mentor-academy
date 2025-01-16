import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Upload, Save } from 'lucide-react';
import { courseService, CourseInput, SectionInput } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseData, setCourseData] = useState<CourseInput>({
    title: '',
    description: '',
    price: 0,
    thumbnailUrl: '',
    hasCertificate: false,
    isLifetimeAccess: true,
    whatWillLearn: [''],
    requirements: [''],
    includes: {
      videoHours: 0,
      downloadableResources: 0,
      articles: 0,
      codingExercises: 0,
      homework: 0,
    },
  });

  const [sections, setSections] = useState<SectionInput[]>([
    {
      title: '',
      lessons: [{ title: '', videoUrl: '' }],
    },
  ]);

  const handleCourseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncludesChange = (name: string, value: number) => {
    setCourseData((prev) => ({
      ...prev,
      includes: { ...prev.includes, [name]: value },
    }));
  };

  const handleArrayInputChange = (
    index: number,
    value: string,
    field: 'whatWillLearn' | 'requirements'
  ) => {
    setCourseData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'whatWillLearn' | 'requirements') => {
    setCourseData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (index: number, field: 'whatWillLearn' | 'requirements') => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSectionChange = (index: number, value: string) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[index] = { ...newSections[index], title: value };
      return newSections;
    });
  };

  const handleLessonChange = (
    sectionIndex: number,
    lessonIndex: number,
    field: string,
    value: string
  ) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].lessons[lessonIndex] = {
        ...newSections[sectionIndex].lessons[lessonIndex],
        [field]: value,
      };
      return newSections;
    });
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { title: '', lessons: [{ title: '', videoUrl: '' }] },
    ]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addLesson = (sectionIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].lessons.push({ title: '', videoUrl: '' });
      return newSections;
    });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter(
        (_, i) => i !== lessonIndex
      );
      return newSections;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await courseService.createCourse(courseData, sections);
      navigate('/profile');
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Title</label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleCourseInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleCourseInputChange}
                    rows={4}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={courseData.thumbnailUrl}
                    onChange={handleCourseInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleCourseInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* What Will Learn */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What Students Will Learn</h2>
              <div className="space-y-2">
                {courseData.whatWillLearn.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayInputChange(index, e.target.value, 'whatWillLearn')}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Learning objective"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'whatWillLearn')}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('whatWillLearn')}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Learning Objective
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Requirements</h2>
              <div className="space-y-2">
                {courseData.requirements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Requirement"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Course Includes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Includes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Video Hours</label>
                  <input
                    type="number"
                    value={courseData.includes.videoHours}
                    onChange={(e) => handleIncludesChange('videoHours', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Downloadable Resources
                  </label>
                  <input
                    type="number"
                    value={courseData.includes.downloadableResources}
                    onChange={(e) =>
                      handleIncludesChange('downloadableResources', Number(e.target.value))
                    }
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Articles</label>
                  <input
                    type="number"
                    value={courseData.includes.articles}
                    onChange={(e) => handleIncludesChange('articles', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coding Exercises</label>
                  <input
                    type="number"
                    value={courseData.includes.codingExercises}
                    onChange={(e) => handleIncludesChange('codingExercises', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Homework Assignments</label>
                  <input
                    type="number"
                    value={courseData.includes.homework}
                    onChange={(e) => handleIncludesChange('homework', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Course Access */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Access</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasCertificate"
                    checked={courseData.hasCertificate}
                    onChange={(e) =>
                      setCourseData((prev) => ({ ...prev, hasCertificate: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasCertificate" className="ml-2 block text-sm text-gray-700">
                    Include Certificate of Completion
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isLifetimeAccess"
                    checked={courseData.isLifetimeAccess}
                    onChange={(e) =>
                      setCourseData((prev) => ({ ...prev, isLifetimeAccess: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isLifetimeAccess" className="ml-2 block text-sm text-gray-700">
                    Lifetime Access
                  </label>
                </div>

                {!courseData.isLifetimeAccess && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Access Duration</label>
                    <input
                      type="text"
                      name="accessDuration"
                      value={courseData.accessDuration || ''}
                      onChange={handleCourseInputChange}
                      placeholder="e.g., 6 months"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
                        placeholder="Section Title"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="ml-2 p-2 text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4 ml-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                handleLessonChange(sectionIndex, lessonIndex, 'title', e.target.value)
                              }
                              placeholder="Lesson Title"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <input
                              type="url"
                              value={lesson.videoUrl}
                              onChange={(e) =>
                                handleLessonChange(
                                  sectionIndex,
                                  lessonIndex,
                                  'videoUrl',
                                  e.target.value
                                )
                              }
                              placeholder="Video URL"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLesson(sectionIndex, lessonIndex)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addLesson(sectionIndex)}
                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  'Creating Course...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}