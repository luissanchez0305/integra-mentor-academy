import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Users, Calendar, Play, Download, FileText, Monitor, Award, ChevronRight, Clock, Globe } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function CourseDetail() {
  const { user, purchasedCourses } = useAuth();
  const navigate = useNavigate();
  const { id: courseId } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        navigate('/');
        return;
      }
      try {
        const course = await courseService.getCourseById(courseId);
        console.log('course', course);
        setCourseData(course);
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (!courseData) {
    return <div>Loading...</div>;
  }

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
                  <span>{courseData.totalStudents ?? 0} estudiantes</span>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Creado por <span className="text-blue-400">{courseData.instructor.name}</span>
              </p>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Última actualización {new Date(courseData.updated_at.toLocaleString()).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-16 rounded-lg overflow-hidden">
                <iframe
                  src={courseData.intro_video_url}
                  title="Vista previa del curso"
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
              <h2 className="text-2xl font-bold mb-4">Sobre este curso</h2>
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
                  <span className="font-medium">Nivel: </span>
                  <span className="ml-2 text-gray-600">{courseData.difficulty}</span>
                </div>
                <div>
                  <span className="font-medium">Idiomas: </span>
                  <span className="text-gray-600">
                    {courseData.course_details.includes.languages ? courseData.course_details.includes.languages.join(', ') : 'Español'}
                  </span>
                </div>
              </div>
            </section>

            {/* Learning Objectives */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Lo que aprenderás</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {courseData.course_details[0].what_will_learn ? courseData.course_details[0].what_will_learn.map((objective, index) => (
                  <div key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{objective}</span>
                  </div>
                )) : <div className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Sin objetivos</span>
                  </div>}
              </div>
            </section>

            {/* Prerequisites */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Requisitos</h2>
              <ul className="space-y-3">
                {courseData.course_details[0].requirements ? courseData.course_details[0].requirements.map((prerequisite, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{prerequisite}</span>
                  </li>
                )) : <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Sin requisitos</span>
                  </li>}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold">
                      ${courseData.sale_price || courseData.price}
                    </span>
                    {courseData.sale_price && courseData.sale_price < courseData.price && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        ${courseData.price}
                      </span>
                    )}
                  </div>
                </div>
                {courseData.instructor_id !== user?.id && !purchasedCourses.some(course => course.id === courseId) && (
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4">
                    Comprar ahora
                  </button>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-bold mb-4">Este curso incluye:</h3>
                  <div className="flex items-center">
                    <Play className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.course_details[0].includes.video_hours} horas de video bajo demanda</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.course_details[0].includes.downloadable_resources} recursos descargables</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.course_details[0].includes.articles} artículos</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{courseData.course_details[0].includes.access} acceso</span>
                  </div>
                  <div className="flex items-center">
                    <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Acceso en {courseData.course_details[0].includes.devices ? courseData.course_details[0].includes.devices.join(', ') : 'Escritorio'}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Certificado de finalización</span>
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