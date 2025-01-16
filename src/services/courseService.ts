import { supabase } from '../lib/supabase';

export interface CourseInput {
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
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
  async createCourse(courseData: CourseInput, sections: SectionInput[]) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        thumbnail_url: courseData.thumbnailUrl,
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
};