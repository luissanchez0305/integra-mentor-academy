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
  salePrice: number;
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

  async updateCourse(courseId: string, courseData: CourseInput, sections: SectionInput[], images: string[]) {
    // Update course basic information
    const { error: courseError } = await supabase
      .from('courses')
      .update({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        intro_video_url: courseData.introVideoUrl,
        has_certificate: courseData.hasCertificate,
        is_lifetime_access: courseData.isLifetimeAccess,
        access_duration: courseData.accessDuration,
        sale_price: courseData.salePrice > 0 ? courseData.salePrice : null,
      })
      .eq('id', courseId);

    if (courseError) throw courseError;

    // Update course details
    const { error: detailsError } = await supabase
      .from('course_details')
      .update({
        what_will_learn: courseData.whatWillLearn,
        requirements: courseData.requirements,
        includes: courseData.includes,
      })
      .eq('course_id', courseId);

    if (detailsError) throw detailsError;

    // Update images
    // First, delete existing images
    await supabase
      .from('course_images')
      .delete()
      .eq('course_id', courseId);

    // Then insert new images
    const imagesToInsert = images.map((imageUrl) => ({
      course_id: courseId,
      image_url: imageUrl,
    }));

    const { error: imagesError } = await supabase
      .from('course_images')
      .insert(imagesToInsert);

    if (imagesError) throw imagesError;

    // Update sections and lessons
    // First, get existing sections to preserve IDs where possible
    const { data: existingSections } = await supabase
      .from('course_sections')
      .select('id, title')
      .eq('course_id', courseId)
      .order('position');

    // Delete sections that are no longer present
    if (existingSections) {
      const existingSectionIds = existingSections.map(section => section.id);
      await supabase
        .from('course_sections')
        .delete()
        .eq('course_id', courseId)
        .not('id', 'in', existingSectionIds);
    }

    // Update or create sections and their lessons
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const existingSection = existingSections?.[i];

      const { data: sectionData, error: sectionError } = existingSection
        ? await supabase
            .from('course_sections')
            .update({
              title: section.title,
              position: i + 1,
            })
            .eq('id', existingSection.id)
            .select()
            .single()
        : await supabase
            .from('course_sections')
            .insert({
              course_id: courseId,
              title: section.title,
              position: i + 1,
            })
            .select()
            .single();

      if (sectionError || !sectionData) throw sectionError;

      // Delete existing lessons for this section
      await supabase
        .from('course_lessons')
        .delete()
        .eq('section_id', sectionData.id);

      // Create new lessons
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

    return { id: courseId };
  },

  async getCourseFullDetails(courseId: string) {
    // Get course basic info and details
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_details (
          what_will_learn,
          requirements,
          includes
        ),
        course_images (
          image_url
        ),
        course_sections (
          id,
          title,
          position,
          course_lessons (
            id,
            title,
            video_url,
            duration,
            position
          )
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;

    // Fetch instructor data separately with RLS error handling
    let instructorData = null;
    try {
      const { data: instructorResult, error: instructorError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', data.instructor_id)
        .single();
      
      if (instructorError) {
        console.warn('Could not fetch instructor data due to RLS:', instructorError);
        instructorData = { name: 'Instructor' };
      } else {
        instructorData = instructorResult;
      }
    } catch (error) {
      console.warn('Failed to fetch instructor data:', error);
      instructorData = { name: 'Instructor' };
    }

    // Transform the data to match the expected format
    const transformedData = {
      ...data,
      introVideoUrl: data.intro_video_url,
      hasCertificate: data.has_certificate,
      isLifetimeAccess: data.is_lifetime_access,
      accessDuration: data.access_duration,
      whatWillLearn: data.course_details[0].what_will_learn,
      requirements: data.course_details[0].requirements,
      includes: data.course_details[0].includes,
      images: data.course_images.map(img => img.image_url),
      sections: data.course_sections
        .sort((a, b) => a.position - b.position)
        .map(section => ({
          title: section.title,
          lessons: section.course_lessons
            .sort((a, b) => a.position - b.position)
            .map(lesson => ({
              title: lesson.title,
              videoUrl: lesson.video_url,
              duration: lesson.duration
            }))
        })),
      instructor: instructorData?.name,
    };

    return transformedData;
  },

  async getCreatedCourses(userId: string) {
    const { data, error } = await supabase
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
      .eq('instructor_id', userId);

    if (error) throw error;

    return data.map(course => ({
      ...course,
      thumbnail: course.course_images[0]?.image_url || '',
      duration: course.course_details[0]?.includes?.videoHours || 0,
    }));
  },

  async getPurchasedCourses(userId: string) {
    console.log('courseService.getPurchasedCourses: Starting for user:', userId);
    
    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        course_id,
        courses (
          *,
          course_images (
            image_url
          ),
          course_details (
            includes
          )
        )
      `)
      .eq('user_id', userId);

    console.log('courseService.getPurchasedCourses: Query result:', { data, error });

    if (error) throw error;

    // Fetch instructor data separately for each course with RLS error handling
    const coursesWithInstructors = await Promise.all(
      data.map(async ({ courses: course }) => {
        let instructorData = null;
        try {
          const { data: instructorResult, error: instructorError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', course.instructor_id)
            .single();
          
          if (instructorError) {
            console.warn('Could not fetch instructor data due to RLS:', instructorError);
            instructorData = { name: 'Instructor' };
          } else {
            instructorData = instructorResult;
          }
        } catch (error) {
          console.warn('Failed to fetch instructor data:', error);
          instructorData = { name: 'Instructor' };
        }

        return {
          ...course,
          thumbnail: course.course_images[0]?.image_url || '',
          duration: course.course_details[0]?.includes?.videoHours || 0,
          instructor: instructorData,
        };
      })
    );

    return coursesWithInstructors;
  },

  async toggleCoursePublishStatus(courseId: string, isPublished: boolean) {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: isPublished })
      .eq('id', courseId);

    if (error) throw error;
  },
  async getLoggedInUser() {
    try {
      if (!supabase.auth) { 
        console.error('Supabase auth is not initialized');
        return null;
      }
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting logged-in user:', error);
      return null;
    }
  },
  async getCourseById(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`*,
          course_images (
            image_url
          ),
          course_details (
            includes,
            what_will_learn,
            requirements
          ),
          course_sections (
            id,
            title,
            position,
            course_lessons (
              id,
              title,
              video_url,
              duration,
              position
            )
          ),
          course_questions (
            user_id,
            question_text,
            answer_text,
            created_at
          ),
          course_notes (
            video_time,
            note_text
          )`)
      .eq('id', courseId)
      .single();

    if (error) throw error;

    // Fetch instructor data separately with RLS error handling
    let instructorData = null;
    try {
      const { data: instructorResult, error: instructorError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', data.instructor_id)
        .single();
      
      if (instructorError) {
        console.warn('Could not fetch instructor data due to RLS:', instructorError);
        instructorData = { id: data.instructor_id, name: 'Instructor', avatar_url: null };
      } else {
        instructorData = instructorResult;
      }
    } catch (error) {
      console.warn('Failed to fetch instructor data:', error);
      instructorData = { id: data.instructor_id, name: 'Instructor', avatar_url: null };
    }

    console.log('instructorData', instructorData);

    // Fetch user data for questions separately with RLS error handling
    const questionsWithUsers = await Promise.all(
      data.course_questions.map(async (question) => {
        let userData = null;
        try {
          const { data: userResult, error: userError } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', question.user_id)
            .single();
          
          if (userError) {
            console.warn('Could not fetch user data for question due to RLS:', userError);
            userData = { name: 'User', avatar_url: null };
          } else {
            userData = userResult;
          }
        } catch (error) {
          console.warn('Failed to fetch user data for question:', error);
          userData = { name: 'User', avatar_url: null };
        }

        return {
          ...question,
          user: userData,
        };
      })
    );

    // Transform the data to use 'instructor' instead of 'instructor_id'
    const transformedData = {
      ...data,
      instructor: instructorData,
      questions: questionsWithUsers,
      notes: data.course_notes
    };

    return transformedData;
  },

  async getCoursesByInstructor(instructorId: number) {
    const { data, error } = await supabase
      .from('courses')
      .select(`id, title`)
      .eq('instructor_id', instructorId)

    if (error) throw error;

    return data;
  },

  async getCoursesByTitle(title: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`*,
          course_images (
            image_url
          ),
          course_details (
            includes,
            what_will_learn,
            requirements
          ),
          course_sections (
            id,
            title,
            position,
            course_lessons (
              id,
              title,
              video_url,
              duration,
              position
            )
          )`)
      .ilike('title', `%${title}%`);
    
    if (error) throw error;

    // Fetch instructor data with RLS error handling (same as getFeaturedCourses)
    const instructorIds = [...new Set(data.map(course => course.instructor_id))];
    let instructorsData = [];
    
    try {
      const { data: instructorsResult, error: instructorsError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', instructorIds);
      
      if (instructorsError) {
        console.warn('Could not fetch instructor data due to RLS:', instructorsError);
        instructorsData = [];
      } else {
        instructorsData = instructorsResult || [];
      }
    } catch (error) {
      console.warn('Failed to fetch instructor data:', error);
      instructorsData = [];
    }

    // Map instructor data to courses with fallback for missing instructor info
    return data.map(course => {
      const instructor = instructorsData?.find(inst => inst.id === course.instructor_id);
      return {
        ...course,
        thumbnail: course.course_images[0]?.image_url || '',
        duration: course.course_details[0]?.includes?.videoHours || 0,
        instructor: instructor || { id: course.instructor_id, name: 'Instructor' }, // Fallback
      };
    });
  },
  
  async addUserPayment(userId: string, total: number, tax: number, courseDetails: { price: number, title: string, courseId: string, quantity: number }[]) {
    const { error } = await supabase
      .from('user_payments')
      .insert({
        user_id: userId,
        total: total,
        taxed: tax,
        course_details: courseDetails,
      });

    if (error) throw error;
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

  async getFeaturedCourses() {
    const { data, error } = await supabase
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
      .eq('featured', true);

    if (error) throw error;

    // Try to fetch instructor data with error handling for RLS
    const instructorIds = [...new Set(data.map(course => course.instructor_id))];
    let instructorsData = [];
    
    try {
      const { data: instructorsResult, error: instructorsError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', instructorIds);
      
      if (instructorsError) {
        console.warn('Could not fetch instructor data due to RLS:', instructorsError);
        instructorsData = [];
      } else {
        instructorsData = instructorsResult || [];
      }
    } catch (error) {
      console.warn('Failed to fetch instructor data:', error);
      instructorsData = [];
    }

    // Map instructor data to courses with fallback for missing instructor info
    const coursesWithInstructors = data.map(course => {
      const instructor = instructorsData?.find(inst => inst.id === course.instructor_id);
      return {
        ...course,
        thumbnail: course.course_images[0]?.image_url || '',
        duration: course.course_details[0]?.includes?.videoHours || 0,
        instructor: instructor || { id: course.instructor_id, name: 'Instructor' }, // Fallback
      };
    });

    return coursesWithInstructors;
  },
};