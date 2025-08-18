import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { specialCourseService } from '../services/specialCourseService';
import { useAuth } from '../contexts/AuthContext';
import SpecialCourseViewer from '../components/SpecialCourseViewer';

export default function SpecialCourseEthicalCulture() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Get the course by slug
        const course = await specialCourseService.getSpecialCourseBySlug('special-course-ethical-culture');
        if (!course) {
          navigate('/404');
          return;
        }

        // Check if user has access
        const accessGranted = await specialCourseService.validateCourseAccess(user.id, course.id);
        setHasAccess(accessGranted);
      } catch (error) {
        console.error('Error checking course access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <SpecialCourseViewer />;
}