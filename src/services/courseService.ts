import { supabase } from '../lib/supabase';

export interface CourseInput {
  instructor_id: string;
  title: string;
  description: string;
  price: number;
  introVideoUrl: string;
  hasCertificate: boolean;
  isLifetimeAccess: boolean;
  accessDuration?: string;
  whatWillLearn: string[];
  requirements: string[];
  includes: {
    videoHours: number;
    downloadableResources: number;
    articles: number;
    codingExercises: number;
    homework: number;
  };
}

export interface SectionInput {
  title: string;
  lessons: {
    title: string;
    videoUrl: string;
    duration?: string;
  }[];
}

export const courseService = {
  async createCourse(courseData: CourseInput, sections: SectionInput[], images: string[]) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        instructor_id: courseData.instructor_id,
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        intro_video_url: courseData.introVideoUrl,
        has_certificate: courseData.hasCertificate,
        is_lifetime_access: courseData.isLifetimeAccess,
        access_duration: courseData.accessDuration,
      })
      .select()
      .single();

    if (courseError) throw courseError;

    const { error: detailsError } = await supabase
      .from('course_details')
      .insert({
        course_id: course.id,
        what_will_learn: courseData.whatWillLearn,
        requirements: courseData.requirements,
        includes: courseData.includes,
      });

    if (detailsError) throw detailsError;

    // Insert images into course_images table
    const imagesToInsert = images.map((imageUrl) => ({
      course_id: course.id,
      image_url: imageUrl,
    }));

    const { error: imagesError } = await supabase
      .from('course_images')
      .insert(imagesToInsert);

    if (imagesError) throw imagesError;

    // Create sections and lessons
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const { data: sectionData, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: course.id,
          title: section.title,
          position: i + 1,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Create lessons for this section
      const lessonsToInsert = section.lessons.map((lesson, index) => ({
        section_id: sectionData.id,
        title: lesson.title,
        video_url: lesson.videoUrl,
        duration: lesson.duration,
        position: index + 1,
      }));

      const { error: lessonsError } = await supabase
        .from('course_lessons')
        .insert(lessonsToInsert);

      if (lessonsError) throw lessonsError;
    }

    return course;
  },

  async getCourseById(courseId: string) {
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        instructor_id,
        title,
        description,
        price,
        intro_video_url,
        has_certificate,
        is_lifetime_access,
        access_duration,
        difficulty,
        updated_at,
        course_details:course_details (
          what_will_learn,
          requirements,
          includes
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;

    return {
      ...course,
      course_details: {
        what_will_learn: course.course_details[0].what_will_learn,
        requirements: course.course_details[0].requirements,
        includes: course.course_details[0].includes,
      }
    };
  },

  async getCoursesByTitle(querySearch: string) {

    const query = supabase
      .from('courses')
      .select(`
        *,
        course_images (
          image_url
        ),
        course_details (
          includes
        )
      `)
      .ilike('title', `%${querySearch}%`);

    const { data, error } = await query;
    console.log('data', data);

    if (error) throw error;

    // Map the data to include the thumbnail and duration
    const coursesWithDetails = data.map(course => ({
      ...course,
      thumbnail: course.course_images[0]?.image_url || '', // Assuming the first image is the thumbnail
      duration: course.course_details[0]?.includes?.videoHours || 0, // Extracting videoHours as duration
    }));

    return coursesWithDetails;
  },

  async addUserPayment(userId: string, total: number, taxed: number, courseDetails: any) {
    const { data, error } = await supabase
      .from('user_payments')
      .insert({
        user_id: userId,
        total,
        taxed,
        course_details: courseDetails,
      });

    if (error) throw error;

    return data;
  },
  
  async addUserCourses(userId: string, courseIds: string[]) {
    const coursesToInsert = courseIds.map(courseId => ({
      user_id: userId,
      course_id: courseId,
    }));

    const { error } = await supabase
      .from('user_courses')
      .insert(coursesToInsert);

    if (error) throw error;
  },
};