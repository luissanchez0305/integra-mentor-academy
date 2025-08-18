import { supabase } from '../lib/supabase';
import { LessonProgress, CourseProgress } from '../types';

export const progressService = {
  // Get user's progress for a specific lesson
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        if (error.code === '42P01') { // relation does not exist
          console.log('lesson_progress table does not exist yet. Please apply the migration.');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  },

  // Update or create lesson progress
  async updateLessonProgress(
    userId: string,
    lessonId: string,
    courseId: string,
    watchTimeSeconds: number,
    totalDurationSeconds: number,
    completionPercentage?: number
  ): Promise<LessonProgress | null> {
    try {
      const existingProgress = await this.getLessonProgress(userId, lessonId);
      
      if (existingProgress) {
        // Update existing record
        const updateData: Record<string, any> = {
          watch_time_seconds: Math.floor(watchTimeSeconds),
          total_duration_seconds: Math.floor(totalDurationSeconds),
          last_accessed: new Date().toISOString(),
        };
        
        if (completionPercentage !== undefined) {
          updateData.completion_percentage = completionPercentage;
        }
        
        const { data, error } = await supabase
          .from('lesson_progress')
          .update(updateData)
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .select()
          .single();

        if (error) {
          throw error;
        }
        return data;
      } else {
        // Insert new record
        const insertData: Record<string, any> = {
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          watch_time_seconds: watchTimeSeconds,
          total_duration_seconds: totalDurationSeconds,
          last_accessed: new Date().toISOString(),
        };
        
        if (completionPercentage !== undefined) {
          insertData.completion_percentage = completionPercentage;
        }
        
        const { data, error } = await supabase
          .from('lesson_progress')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          if (error.code === '42P01') { // relation does not exist
            console.log('lesson_progress table does not exist yet. Please apply the migration.');
            return null;
          }
          throw error;
        }
        return data;
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return null;
    }
  },

  // Mark lesson as completed
  async markLessonCompleted(userId: string, lessonId: string, courseId: string): Promise<LessonProgress | null> {
    try {
      // First, try to get existing progress to preserve watch_time_seconds
      const existingProgress = await this.getLessonProgress(userId, lessonId);
      console.log('existingProgress:', existingProgress);
      
      if (existingProgress) {
        // Update existing record
        const { data, error } = await supabase
          .from('lesson_progress')
          .update({
            is_completed: true,
            completion_percentage: 100,
            completed_at: new Date().toISOString(),
            last_accessed: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .select()
          .single();
        
        if (error) {
          console.log('update error:', error);
          throw error;
        }
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            course_id: courseId,
            is_completed: true,
            completion_percentage: 100,
            completed_at: new Date().toISOString(),
            last_accessed: new Date().toISOString(),
            watch_time_seconds: 0,
            total_duration_seconds: 0,
          })
          .select()
          .single();
        
        if (error) {
          if (error.code === '42P01') { // relation does not exist
            console.log('lesson_progress table does not exist yet. Please apply the migration.');
            return null;
          }
          console.log('insert error:', error);
          throw error;
        }
        return data;
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      return null;
    }
  },

  // Get all progress for a course
  async getCourseProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('last_accessed', { ascending: false });

      if (error) {
        // If the table doesn't exist yet, return empty array
        if (error.code === '42P01') { // relation does not exist
          console.log('lesson_progress table does not exist yet. Please apply the migration.');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return [];
    }
  },

  // Get course progress summary
  async getCourseProgressSummary(userId: string, courseId: string): Promise<CourseProgress> {
    try {
      // First get all sections for the course
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        throw sectionsError;
      }

      const sectionIds = sections?.map(s => s.id) || [];
      
      // Then get total lesson count for those sections
      let totalLessons = 0;
      if (sectionIds.length > 0) {
        const { data: lessons, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('id')
          .in('section_id', sectionIds);

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
          throw lessonsError;
        }
        
        totalLessons = lessons?.length || 0;
      }

      // Get user's progress for this course
      const progressData = await this.getCourseProgress(userId, courseId);
      
      const completedLessons = progressData?.filter(p => p.is_completed).length || 0;
      const totalWatchTime = progressData?.reduce((sum, p) => sum + (p.watch_time_seconds || 0), 0) || 0;
      const lastAccessed = progressData?.reduce((latest, p) => {
        const progressDate = new Date(p.last_accessed);
        const latestDate = new Date(latest);
        return progressDate > latestDate ? p.last_accessed : latest;
      }, new Date(0).toISOString()) || new Date().toISOString();

      return {
        course_id: courseId,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        completion_percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        last_accessed: lastAccessed,
        total_watch_time_seconds: totalWatchTime,
      };
    } catch (error) {
      console.error('Error in getCourseProgressSummary:', error);
      // Return a default progress object if there's an error
      return {
        course_id: courseId,
        total_lessons: 0,
        completed_lessons: 0,
        completion_percentage: 0,
        last_accessed: new Date().toISOString(),
        total_watch_time_seconds: 0,
      };
    }
  },

  // Get progress for multiple courses (for My Courses page)
  async getMultipleCourseProgress(userId: string, courseIds: string[]): Promise<CourseProgress[]> {
    const progressPromises = courseIds.map(courseId => 
      this.getCourseProgressSummary(userId, courseId)
    );

    return Promise.all(progressPromises);
  },

  // Check if user has access to a course
  async validateCourseAccess(userId: string, courseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  },

  // Get lessons with progress for a course
  async getLessonsWithProgress(userId: string, courseId: string) {
    // Get all lessons for the course
    const { data: allLessons, error: allLessonsError } = await supabase
      .from('course_sections')
      .select(`
        *,
        course_lessons (
          *
        )
      `)
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (allLessonsError) throw allLessonsError;

    // Get all progress for this course
    const progressData = await this.getCourseProgress(userId, courseId);
    const progressMap = new Map(progressData.map(p => [p.lesson_id, p]));

    // Merge progress data with lessons
    const sectionsWithProgress = allLessons?.map(section => ({
      ...section,
      course_lessons: section.course_lessons.map(lesson => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || null,
      })),
    })) || [];

    return sectionsWithProgress;
  },
};
