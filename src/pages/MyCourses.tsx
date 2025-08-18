import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/progressService';
import { Course, CourseProgress } from '../types';

export default function MyCourses() {
  const { user, purchasedCourses, loading: authLoading } = useAuth();
  const [coursesWithProgress, setCoursesWithProgress] = useState<Array<Course & { progress: CourseProgress }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) {
      return;
    }

    // Only redirect if auth has finished loading and user is not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        
        const courseIds = purchasedCourses.map(course => course.id);
        const progressData = await progressService.getMultipleCourseProgress(user.id, courseIds);
        
        const coursesWithProgressData = purchasedCourses.map(course => {
          const progress = progressData.find(p => p.course_id === course.id);
          return {
            ...course,
            progress: progress || {
              course_id: course.id,
              total_lessons: 0,
              completed_lessons: 0,
              completion_percentage: 0,
              last_accessed: new Date().toISOString(),
              total_watch_time_seconds: 0,
            },
          };
        });

        setCoursesWithProgress(coursesWithProgressData);
      } catch (error) {
        console.error('Error fetching course progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (purchasedCourses.length > 0) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [user, purchasedCourses, navigate, authLoading]);

  console.log('coursesWithProgress:', coursesWithProgress);
  const filteredCourses = coursesWithProgress.filter(course => {
    if (filter === 'completed') return course.progress.completion_percentage === 100;
    if (filter === 'in-progress') return course.progress.completion_percentage > 0 && course.progress.completion_percentage < 100;
    return true;
  });

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-40 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mis Cursos</h1>
          <p className="text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'Todos los cursos', count: coursesWithProgress.length },
              { 
                key: 'in-progress', 
                label: 'En progreso', 
                count: coursesWithProgress.filter(c => c.progress.completion_percentage > 0 && c.progress.completion_percentage < 100).length 
              },
              { 
                key: 'completed', 
                label: 'Completados', 
                count: coursesWithProgress.filter(c => c.progress.completion_percentage === 100).length 
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No tienes cursos comprados' : 
               filter === 'completed' ? 'No tienes cursos completados' : 
               'No tienes cursos en progreso'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? 'Explora nuestro catálogo y encuentra el curso perfecto para ti' :
               filter === 'completed' ? 'Completa algunos cursos para verlos aquí' :
               'Comienza a ver tus cursos para que aparezcan aquí'}
            </p>
            {filter === 'all' && (
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Explorar Cursos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={course.thumbnail || '/placeholder-course.jpg'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Link
                      to={`/course/${course.id}/learn`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continuar
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {/* Course Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center mb-3">
                    <img
                      src={course.instructor.avatar_url || '/default-avatar.png'}
                      alt={course.instructor.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600">{course.instructor.name}</span>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">Progreso del curso</span>
                      <span className="font-semibold">{Math.round(course.progress.completion_percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress.completion_percentage}%` }}
                      ></div>
                    </div>
                    
                    {/* Detailed Progress Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Lecciones:</span>
                        <span className="font-medium text-gray-700">
                          {course.progress.completed_lessons}/{course.progress.total_lessons}
                        </span>
                      </div>
                      {course.progress.total_watch_time_seconds > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Tiempo:</span>
                          <span className="font-medium text-gray-700">
                            {formatDuration(course.progress.total_watch_time_seconds)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Último acceso:</span>
                        <span className="font-medium text-gray-700">
                          {new Date(course.progress.last_accessed).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Estado:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                          course.progress.completion_percentage === 100
                            ? 'bg-green-100 text-green-800'
                            : course.progress.completion_percentage > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.progress.completion_percentage === 100
                            ? 'Completado'
                            : course.progress.completion_percentage > 0
                            ? 'En progreso'
                            : 'No iniciado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/course/${course.id}/learn`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {course.progress.completion_percentage > 0 ? 'Continuar' : 'Comenzar'}
                    </Link>
                    <Link
                      to={`/course/${course.id}`}
                      className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Detalles
                    </Link>
                  </div>

                  {/* Completion Badge */}
                  {course.progress.completion_percentage === 100 && (
                    <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completado
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
