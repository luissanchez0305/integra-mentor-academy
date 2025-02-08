import { supabase } from '../lib/supabase';

interface Course {
    id: string
}

export const userCourseService = {
    async getUserCoursesByCoursesArray(courses: Course[]) {
        const { data, error } = await supabase
            .from('user_courses')
            .select('id')
            .eq('course_id', courses.map((ic) => ic.id)[0]);
        
        if(error) throw error;
        return data;
    }
}