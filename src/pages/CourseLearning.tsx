import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, PenTool, ArrowLeft, Lock } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { useAuth } from '../contexts/AuthContext';
import { Course, CourseSection, CourseLesson } from '../types';

export default function CourseLearning() {
  const { user, loading: authLoading } = useAuth();
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [sectionsWithProgress, setSectionsWithProgress] = useState<CourseSection[]>([]);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson & { section_title: string } | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const currentTimeRef = useRef(0);
  const youtubePlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return;
    
    if (!user || !courseId) {
      navigate('/login');
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Check course access
        const accessGranted = await progressService.validateCourseAccess(user.id, courseId);
        setHasAccess(accessGranted);
        
        if (!accessGranted) {
          setLoading(false);
          return;
        }

        // Fetch course data
        const course = await courseService.getCourseById(courseId);
        setCourseData(course);

        // Fetch sections with progress
        const sectionsData = await progressService.getLessonsWithProgress(user.id, courseId);
        setSectionsWithProgress(sectionsData);

        // Find the most recently accessed lesson or the first incomplete lesson
        let targetLesson = null;
        let targetSection = null;
        let mostRecentAccess = new Date(0);

        // First, try to find the most recently accessed lesson
        for (const section of sectionsData) {
          for (const lesson of section.course_lessons) {
            if (lesson.progress && lesson.progress.last_accessed) {
              const accessDate = new Date(lesson.progress.last_accessed);
              if (accessDate > mostRecentAccess) {
                mostRecentAccess = accessDate;
                targetLesson = lesson;
                targetSection = section;
              }
            }
          }
        }

        // If no recently accessed lesson found, find first incomplete lesson
        if (!targetLesson) {
          for (const section of sectionsData) {
            for (const lesson of section.course_lessons) {
              if (!lesson.progress || !lesson.progress.is_completed) {
                targetLesson = lesson;
                targetSection = section;
                break;
              }
            }
            if (targetLesson) break;
          }
        }

        // If still no lesson found, default to first lesson
        if (!targetLesson && sectionsData.length > 0 && sectionsData[0].course_lessons.length > 0) {
          targetLesson = sectionsData[0].course_lessons[0];
          targetSection = sectionsData[0];
        }

        // Set the target lesson as current
        if (targetLesson && targetSection) {
          setCurrentLesson({
            ...targetLesson,
            section_title: targetSection.title,
          });
          setSelectedLessonId(targetLesson.id);
          const savedTime = targetLesson.progress?.watch_time_seconds || 0;
          currentTimeRef.current = savedTime;
          setDisplayTime(savedTime);
          setVideoDuration(targetLesson.progress?.total_duration_seconds || 0);
          setCompletionPercentage(targetLesson.progress?.completion_percentage || 0);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();

    // Cleanup function to clear intervals when component unmounts
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (displayTimeIntervalRef.current) {
        clearInterval(displayTimeIntervalRef.current);
      }
    };
  }, [user, courseId, navigate, authLoading]);

  // Start progress tracking when lesson changes
  useEffect(() => {
    if (currentLesson && user) {
      // Clear previous intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (displayTimeIntervalRef.current) {
        clearInterval(displayTimeIntervalRef.current);
      }

      // Start tracking progress every 10 seconds, but only when video is playing
      progressIntervalRef.current = setInterval(() => {
        try {
          const player = youtubePlayerRef.current;
          if (player && typeof player.getPlayerState === 'function') {
            const playerState = player.getPlayerState();
            
            // Only track progress when video is playing (state = 1)
            if (playerState === 1) {
              const currentVideoTime = player.getCurrentTime();
              const duration = player.getDuration();
              
              if (duration > 0) {
                const percentage = Math.min(100, Math.round((currentVideoTime / duration) * 100));
                
                // Store in ref to avoid re-renders
                // currentTimeRef.current = currentVideoTime;
                
                // Only update completion percentage and duration when they actually change
                // Don't update displayTime here to prevent video interruption
                if (Math.abs(completionPercentage - percentage) >= 1) {
                  setCompletionPercentage(percentage);
                }
                
                if (Math.abs(videoDuration - duration) >= 1) {
                  setVideoDuration(duration);
                }
                
                // Update progress in database every 30 seconds
                progressService.updateLessonProgress(
                  user.id,
                  currentLesson.id,
                  courseId!,
                  currentVideoTime,
                  duration,
                  percentage
                ).catch(error => {
                  console.error('Error updating progress:', error);
                });
              }
            }
          }
        } catch (error) {
          console.error('Error tracking video progress:', error);
        }
      }, 10000); // Check every 10 seconds

      // Start a separate, more frequent interval for updating display time
      // This won't interfere with video playback since it only updates the time display
      displayTimeIntervalRef.current = setInterval(() => {
        if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getPlayerState === 'function') {
          const playerState = youtubePlayerRef.current.getPlayerState();
          if (playerState === 1) { // Only update when playing
            const currentTime = youtubePlayerRef.current.getCurrentTime();
            if (currentTime > 0) {
              setDisplayTime(currentTime);
            }
          }
        }
      }, 1000); // Update display time every second

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        if (displayTimeIntervalRef.current) {
          clearInterval(displayTimeIntervalRef.current);
        }
      };
    }
  }, [currentLesson, user, courseId]);

  const handleLessonSelect = async (lesson: CourseLesson, sectionTitle: string) => {
    // Clear existing intervals before switching lessons
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (displayTimeIntervalRef.current) {
      clearInterval(displayTimeIntervalRef.current);
    }

    setCurrentLesson({ ...lesson, section_title: sectionTitle });
    setSelectedLessonId(lesson.id);
    
    const savedTime = lesson.progress?.watch_time_seconds || 0;
    const savedDuration = lesson.progress?.total_duration_seconds || 0;
    const savedCompletion = lesson.progress?.completion_percentage || 0;
    
    currentTimeRef.current = savedTime;
    setDisplayTime(savedTime);
    setVideoDuration(savedDuration);
    setCompletionPercentage(savedCompletion);

    // If YouTube player is ready and we have saved progress, seek to that position
    if (youtubePlayerRef.current && savedTime > 0) {
      try {
        youtubePlayerRef.current.seekTo(savedTime, true);
      } catch (error) {
        console.error('Error seeking to saved position:', error);
      }
    }

    // Mark lesson as accessed
    if (user) {
      try {
        await progressService.updateLessonProgress(
          user.id,
          lesson.id,
          courseId!,
          savedTime,
          savedDuration,
          savedCompletion
        );
      } catch (error) {
        console.error('Error updating lesson access:', error);
        // Continue silently if table doesn't exist yet
      }
    }
  };

  const handleMarkCompleted = async () => {
    if (!user || !currentLesson) return;

    try {
      await progressService.markLessonCompleted(user.id, currentLesson.id, courseId!);
      
      // Refresh sections data to update progress
      const sectionsData = await progressService.getLessonsWithProgress(user.id, courseId!);
      setSectionsWithProgress(sectionsData);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      // Continue silently if table doesn't exist yet
    }
  };

  const extractYouTubeVideoId = (url: string): string => {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] || match[2] : '';
  };

  const onPlayerReady = (event: { target: any }) => {
    youtubePlayerRef.current = event.target;
    
    // If there's saved progress, seek to that position
    if (currentTimeRef.current > 0) {
      event.target.seekTo(currentTimeRef.current, true);
    }
  };

  const onPlayerStateChange = (event: { data: number }) => {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (event.data === 1) { // Playing
      // Start progress tracking when video starts playing
      console.log('Video started playing');
    } else if (event.data === 0) { // Ended
      // Video ended, mark as 100% complete
      if (user && currentLesson) {
        progressService.updateLessonProgress(
          user.id,
          currentLesson.id,
          courseId!,
          videoDuration,
          videoDuration,
          100
        ).catch(error => {
          console.error('Error updating progress on video end:', error);
        });
      }
    }
  };

  const youtubeOpts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      start: Math.floor(currentTimeRef.current),
    },
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-8">
            No tienes acceso a este curso. Por favor, compra el curso para poder acceder al contenido.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </button>
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Ver Detalles del Curso
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData || !currentLesson) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Curso no encontrado</h2>
          <p className="text-gray-600">Este curso no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Left side - Video Player */}
        <div className="flex-1 bg-black">
          <div className="flex flex-col h-full">
            {/* Video Player */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute top-0 left-0 w-full h-full">
                <YouTube
                  videoId={extractYouTubeVideoId(currentLesson.video_url)}
                  opts={youtubeOpts}
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6 bg-white flex-1">
              {/* Course Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate('/my-courses')}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Mis Cursos
                </button>
                <button
                  onClick={handleMarkCompleted}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    currentLesson.progress?.is_completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={currentLesson.progress?.is_completed}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {currentLesson.progress?.is_completed ? 'Completado' : 'Marcar como Completado'}
                </button>
              </div>

              {/* Course Title */}
              <h1 className="text-3xl font-extrabold text-blue-600 mb-2">{courseData.title}</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {`${currentLesson.section_title} - ${currentLesson.title}`}
              </h2>
              
              {/* Progress Indicator */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso de la lección</span>
                  <span>{Math.round(completionPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                {videoDuration > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{Math.floor(displayTime / 60)}:{Math.floor(displayTime % 60).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>

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
                    onClick={() => setActiveTab('notes')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'notes'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Notas
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'description' && (
                  <div>
                    <p className="text-gray-600 mb-6">{courseData.description}</p>
                    <div className="flex items-start space-x-4">
                      <img
                        src={courseData.instructor.avatar_url || '/default-avatar.png'}
                        alt={courseData.instructor.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{courseData.instructor.name}</h3>
                        <p className="text-sm text-gray-500">Instructor del curso</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <textarea
                      placeholder="Toma notas para esta lección..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-4"
                    />
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <PenTool className="h-4 w-4 mr-2" />
                      Guardar Notas
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Course Content */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenido del Curso</h2>
            <div className="space-y-4">
              {sectionsWithProgress.map((section) => (
                <div key={section.id}>
                  <h3 className="font-medium text-gray-900 mb-2">{section.title}</h3>
                  <div className="space-y-1">
                    {section.course_lessons.map((lesson) => {
                      const lessonCompletion = selectedLessonId === lesson.id ? completionPercentage : (lesson.progress?.completion_percentage || 0);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson, section.title)}
                          className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                            selectedLessonId === lesson.id
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                              : lesson.progress?.is_completed
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : lessonCompletion > 0
                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex-1 flex items-center">
                            {lesson.progress?.is_completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            ) : lessonCompletion > 0 ? (
                              <div className="relative mr-3">
                                <div className="h-5 w-5 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                                  <div 
                                    className="h-3 w-3 rounded-full bg-yellow-400" 
                                    style={{ 
                                      transform: `scale(${lessonCompletion / 100})` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <Play className="h-5 w-5 text-gray-400 mr-3" />
                            )}
                            <div className="flex-1">
                              <span className="text-sm font-medium block">{lesson.title}</span>
                              {lessonCompletion > 0 && (
                                <span className="text-xs text-gray-500">
                                  {Math.round(lessonCompletion)}% completado
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{lesson.duration}</span>
                        </button>
                      );
                    })}
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
