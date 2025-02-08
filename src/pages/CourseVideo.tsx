import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, MessageCircle, Book, PenTool, FileText, User, Star, Clock } from 'lucide-react';
import { courseService } from '../services/courseService';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { userCourseService } from '../services/userCourseService';

export default function CourseVideo() {
  const [activeTab, setActiveTab] = useState('description');
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string, section_title: string } | null>(null);
  const [instructorCoursesCount, setInstructorCoursesCount] = useState(0);
  const [userCoursesCount, setUserCoursesCount] = useState(0);
  const { id: courseId } = useParams<{ id: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseData() {
      if (!courseId) {
        navigate('/');
        return;
      }
      try {
        const data = await courseService.getCourseById(courseId);
        console.log('data', data);
        setCourseData(data);
        // Set default video to the first lesson
        if (data.course_sections.length > 0 && data.course_sections[0].course_lessons.length > 0) {
          setCurrentVideo({
            url: data.course_sections[0].course_lessons[0].video_url,
            title: data.course_sections[0].course_lessons[0].title,
            section_title: data.course_sections[0].title,
          });
          setSelectedLessonId(data.course_sections[0].course_lessons[0].id);
        }

        courseService.getCoursesByInstructor(data.instructor.id)
          .then(async (instructorCourses) => {
            setInstructorCoursesCount(instructorCourses.length);
            const userCourses = await userCourseService.getUserCoursesByCoursesArray(instructorCourses)
            setUserCoursesCount(userCourses.length);
          })
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    }

    fetchCourseData();
  }, []);

  if (!courseData || !currentVideo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left side - Video Player */}
        <div className="flex-1 bg-black">
          <div className="flex flex-col h-full">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(currentVideo.url)}`}
                title={`${currentVideo.section_title} - ${currentVideo.title}`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-6 bg-white flex-1 overflow-y-auto">
              {/* Stylish Course Title */}
              <h1 className="text-3xl font-extrabold text-blue-600 mb-4">{courseData.title}</h1>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{`${currentVideo.section_title} - ${currentVideo.title}`}</h1>
              
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
                    Descripción
                  </button>
                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'qa'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Preguntas y Respuestas
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'notes'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Notas
                  </button>
                  {/* <button
                    onClick={() => setActiveTab('resources')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'resources'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Recursos
                  </button> */}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6 flex-1 overflow-y-auto">
                {activeTab === 'description' && (
                  <div>
                    <p className="text-gray-600 mb-6">{courseData.description}</p>
                    <div className="flex items-start space-x-4">
                      <img
                        src={courseData.instructor.avatar_url}
                        alt={courseData.instructor.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{courseData.instructor.name}</h3>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <div className="flex items-center mr-4">
                            <Book className="h-4 w-4 mr-1" />
                            {instructorCoursesCount} {`curso${instructorCoursesCount > 1 || instructorCoursesCount === 0? 's' : ''}`}
                          </div>
                          <div className="flex items-center mr-4">
                            <User className="h-4 w-4 mr-1" />
                            {userCoursesCount} {`estudiante${userCoursesCount > 1 || userCoursesCount === 0? 's' : ''}`}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {courseData.instructor.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div className="space-y-6">
                    {courseData.questions && courseData.questions.length > 0 ? (
                      courseData.questions.map((question) => (
                        <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={question.user.avatar_url}
                              alt={question.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{question.profiles.name}</h4>
                                <span className="text-sm text-gray-500">{question.created_at}</span>
                              </div>
                              <p className="mt-1 text-gray-600">{question.question_text}</p>
                              {question.answer_text && (
                                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                  <p className="text-gray-600">{question.answer_text}</p>
                                </div>
                              )}
                              <div className="mt-2 flex items-center space-x-4">
                                <button className="text-sm text-gray-500 hover:text-gray-700">
                                  Me gusta ({question.likes})
                                </button>
                                <button className="text-sm text-gray-500 hover:text-gray-700">
                                  Responder
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No hay preguntas hechas para este curso todavía.</p>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="flex space-x-4">
                    {/* Left Column - Notes Form */}
                    <div className="flex-1">
                      <textarea
                        placeholder="Toma notas para esta lección..."
                        className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        <PenTool className="h-4 w-4 mr-2" />
                        Guardar Notas
                      </button>
                    </div>
                    
                    {/* Right Column - List of Notes */}
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Notas del Curso</h3>
                      <ul className="space-y-2">
                        {courseData.notes && courseData.notes.length > 0 ? (
                          courseData.notes.map((note, index) => (
                            <li key={index} className="p-2 bg-white rounded-lg shadow-sm">
                              <p className="text-gray-600">{note.text}</p>
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-600">No hay notas disponibles para este curso.</p>
                        )}
                      </ul>
                    </div>
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
                          Descargar
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenido del Curso</h2>
            <div className="space-y-4">
              {courseData.course_sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="font-medium text-gray-900 mb-2">{section.title}</h3>
                  <div className="space-y-1">
                    {section.course_lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentVideo({ url: lesson.video_url, title: lesson.title, section_title: section.title });
                          setSelectedLessonId(lesson.id);
                        }}
                        className={`w-full flex items-center p-2 rounded-lg text-left ${
                          selectedLessonId === lesson.id
                            ? 'bg-blue-100 text-blue-700'
                            : lesson.current
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

function extractYouTubeVideoId(url: string): string {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] || match[2] : '';
}