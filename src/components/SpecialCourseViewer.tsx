import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { specialCourseService } from '../services/specialCourseService';
import { useAuth } from '../contexts/AuthContext';
import { SpecialCourse, SpecialCourseSection, SpecialCourseTest, SpecialCourseProgress } from '../types/specialCourse';
import SpecialCourseTest from './SpecialCourseTest';
import CertificateView from './CertificateView';

export default function SpecialCourseViewer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<SpecialCourse | null>(null);
  const [sections, setSections] = useState<SpecialCourseSection[]>([]);
  const [tests, setTests] = useState<SpecialCourseTest[]>([]);
  const [progress, setProgress] = useState<SpecialCourseProgress | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const soundRef = useRef<Howl | null>(null);
  const currentSection = sections[currentSectionIndex];

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!slug || !user) return;

      try {
        setLoading(true);
        
        const courseData = await specialCourseService.getSpecialCourseBySlug(slug);
        if (!courseData) {
          navigate('/404');
          return;
        }

        // Check access
        const accessGranted = await specialCourseService.validateCourseAccess(user.id, courseData.id);
        setHasAccess(accessGranted);
        
        if (!accessGranted) {
          setLoading(false);
          return;
        }

        setCourse(courseData);
        
        const [sectionsData, testsData, progressData] = await Promise.all([
          specialCourseService.getCourseSections(courseData.id),
          specialCourseService.getCourseTests(courseData.id),
          specialCourseService.getUserProgress(user.id, courseData.id)
        ]);

        setSections(sectionsData);
        setTests(testsData);
        setProgress(progressData);
        
        // Set current section based on progress
        if (progressData) {
          setCurrentSectionIndex(Math.max(0, progressData.current_section - 1));
        }
      } catch (error) {
        console.error('Error loading course data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [slug, user, navigate]);

  // Handle keyboard navigation
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'ArrowRight' || event.code === 'Enter') {
      event.preventDefault();
      nextSection();
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault();
      previousSection();
    }
  }, [currentSectionIndex, sections.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Play sound for current section
  useEffect(() => {
    if (currentSection?.sound_url && soundEnabled) {
      // Stop previous sound
      if (soundRef.current) {
        soundRef.current.stop();
      }

      // Play new sound
      soundRef.current = new Howl({
        src: [currentSection.sound_url],
        autoplay: true,
        onplay: () => setIsPlaying(true),
        onend: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false)
      });
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, [currentSection, soundEnabled]);

  const nextSection = async () => {
    if (currentSectionIndex < sections.length - 1) {
      const newIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(newIndex);
      await updateProgress(newIndex + 1, [...(progress?.completed_sections || []), currentSectionIndex + 1]);
    }
  };

  const previousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const updateProgress = async (currentSection: number, completedSections: number[]) => {
    if (!user || !course) return;

    try {
      const updatedProgress = await specialCourseService.updateUserProgress(
        user.id,
        course.id,
        currentSection,
        completedSections,
        sections.length
      );
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (soundRef.current) {
      if (soundEnabled) {
        soundRef.current.stop();
      } else if (currentSection?.sound_url) {
        soundRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-300 mb-8">
            No tienes acceso a este curso. Por favor, compra el curso para poder acceder al contenido.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!course || !currentSection) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Curso no encontrado</h2>
          <p className="text-gray-300">Este curso no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  // Handle test sections
  if (currentSection.section_type === 'test') {
    const test = tests.find(t => t.lesson_number === currentSection.lesson_number || t.is_final_test);
    if (test) {
      return (
        <SpecialCourseTest
          test={test}
          course={course}
          onComplete={() => nextSection()}
          onBack={() => previousSection()}
        />
      );
    }
  }

  // Handle certificate section
  if (currentSection.section_type === 'certificate') {
    return (
      <CertificateView
        course={course}
        user={user!}
        onBack={() => previousSection()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/my-courses')}
            className="inline-flex items-center text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Mis Cursos
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Progress indicator */}
            <div className="text-sm text-gray-300">
              {currentSectionIndex + 1} / {sections.length}
            </div>
            
            {/* Sound controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                disabled={!currentSection.sound_url}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleSound}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-20 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSectionIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
            >
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold mb-6 text-center"
              >
                {currentSection.title}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="prose prose-lg prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: currentSection.content }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-6 py-3">
          <button
            onClick={previousSection}
            disabled={currentSectionIndex === 0}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="text-sm text-gray-300">
            Presiona Espacio, Enter o → para continuar
          </div>
          
          <button
            onClick={nextSection}
            disabled={currentSectionIndex === sections.length - 1}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
        />
      </div>
    </div>
  );
}