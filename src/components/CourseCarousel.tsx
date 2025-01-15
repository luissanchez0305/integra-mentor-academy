import React from 'react';
import Slider from 'react-slick';
import CourseCard from './CourseCard';
import { Course } from '../types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CourseCarouselProps {
  title: string;
  courses: Course[];
}

export default function CourseCarousel({ title, courses }: CourseCarouselProps) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <Slider {...settings}>
        {courses.map((course) => (
          <div key={course.id} className="px-2">
            <CourseCard course={course} />
          </div>
        ))}
      </Slider>
    </div>
  );
}