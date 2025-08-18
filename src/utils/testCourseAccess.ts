import { supabase } from '../lib/supabase';

// Test utility functions to help debug the My Courses page
export const testCourseAccess = {
  // Test if user_courses table exists and has RLS policies
  async checkUserCoursesTable() {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .limit(1);
      
      console.log('user_courses table check:', { data, error });
      return { exists: !error, data, error };
    } catch (error) {
      console.error('user_courses table error:', error);
      return { exists: false, error };
    }
  },

  // Check current user's purchased courses
  async getUserPurchases(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', userId);
      
      console.log('User purchases:', { userId, data, error });
      return { data, error };
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      return { data: null, error };
    }
  },

  // Get all available courses
  async getAllCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, instructor_id, is_published')
        .eq('is_published', true);
      
      console.log('All courses:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, error };
    }
  },

  // Manually add a course purchase for testing (USE CAREFULLY!)
  async addTestPurchase(userId: string, courseId: string) {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .insert({
          user_id: userId,
          course_id: courseId,
        })
        .select();
      
      console.log('Test purchase added:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Error adding test purchase:', error);
      return { data: null, error };
    }
  },

  // Run full diagnostic
  async runDiagnostic(userId: string) {
    console.log('=== Course Access Diagnostic ===');
    
    console.log('1. Checking user_courses table...');
    const tableCheck = await this.checkUserCoursesTable();
    
    console.log('2. Checking user purchases...');
    const purchases = await this.getUserPurchases(userId);
    
    console.log('3. Checking available courses...');
    const courses = await this.getAllCourses();
    
    const result = {
      tableExists: tableCheck.exists,
      userPurchases: purchases.data?.length || 0,
      availableCourses: courses.data?.length || 0,
      errors: {
        table: tableCheck.error,
        purchases: purchases.error,
        courses: courses.error,
      }
    };
    
    console.log('=== Diagnostic Result ===', result);
    return result;
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testCourseAccess = testCourseAccess;
}
