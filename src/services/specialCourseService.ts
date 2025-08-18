import { supabase } from '../lib/supabase';
import { SpecialCourse, SpecialCourseSection, SpecialCourseTest, SpecialCourseProgress, SpecialCourseTestResult } from '../types/specialCourse';

export const specialCourseService = {
  // Get special course by slug
  async getSpecialCourseBySlug(slug: string): Promise<SpecialCourse | null> {
    const { data, error } = await supabase
      .from('special_courses')
      .select(`
        *,
        profiles!special_courses_instructor_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      instructor: data.profiles
    };
  },

  // Get course sections
  async getCourseSections(courseId: string): Promise<SpecialCourseSection[]> {
    const { data, error } = await supabase
      .from('special_course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('section_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get course tests
  async getCourseTests(courseId: string): Promise<SpecialCourseTest[]> {
    const { data, error } = await supabase
      .from('special_course_tests')
      .select(`
        *,
        special_course_test_questions (
          *
        )
      `)
      .eq('course_id', courseId)
      .order('lesson_number', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(test => ({
      ...test,
      questions: test.special_course_test_questions.sort((a, b) => a.question_order - b.question_order)
    }));
  },

  // Get user progress
  async getUserProgress(userId: string, courseId: string): Promise<SpecialCourseProgress | null> {
    const { data, error } = await supabase
      .from('special_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Update user progress
  async updateUserProgress(
    userId: string,
    courseId: string,
    currentSection: number,
    completedSections: number[],
    totalSections: number
  ): Promise<SpecialCourseProgress> {
    const completionPercentage = Math.round((completedSections.length / totalSections) * 100);
    const isCompleted = completionPercentage === 100;

    const progressData = {
      user_id: userId,
      course_id: courseId,
      current_section: currentSection,
      completed_sections: completedSections,
      completion_percentage: completionPercentage,
      is_completed: isCompleted,
      last_accessed: new Date().toISOString(),
      ...(isCompleted && { completed_at: new Date().toISOString() })
    };

    const { data, error } = await supabase
      .from('special_course_progress')
      .upsert(progressData, { onConflict: 'user_id,course_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit test result
  async submitTestResult(
    userId: string,
    testId: string,
    courseId: string,
    answers: Record<string, number>,
    questions: any[]
  ): Promise<SpecialCourseTestResult> {
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    // Calculate score
    questions.forEach((question, index) => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 70; // 70% passing grade

    const resultData = {
      user_id: userId,
      test_id: testId,
      course_id: courseId,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      answers,
      passed,
      completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('special_course_test_results')
      .upsert(resultData, { onConflict: 'user_id,test_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get test results for user
  async getUserTestResults(userId: string, courseId: string): Promise<SpecialCourseTestResult[]> {
    const { data, error } = await supabase
      .from('special_course_test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) throw error;
    return data || [];
  },

  // Check if user has access to course
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
  }
};