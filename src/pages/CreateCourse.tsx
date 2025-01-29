import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, X } from 'lucide-react';
import { courseService, CourseInput, SectionInput } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { supabase } from '../lib/supabase';

const carouselImageStyle = {
  maxHeight: '400px',
  objectFit: 'cover',
};

const thumbnailStyle = {
  maxHeight: '80px',
  objectFit: 'cover',
  cursor: 'pointer',
  borderRadius: '4px',
};

const fileInputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  borderRadius: '0.375rem',
  border: '1px solid #d1d5db',
  backgroundColor: '#f9fafb',
  color: '#374151',
  cursor: 'pointer',
  marginTop: '0.25rem',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  transition: 'background-color 0.2s ease-in-out',
};

export default function CreateCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateCreatedCourses } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseData, setCourseData] = useState<CourseInput>({
    instructor_id: user?.id || '',
    title: '',
    description: '',
    introVideoUrl: '',
    price: 0,
    hasCertificate: false,
    isLifetimeAccess: true,
    whatWillLearn: [''],
    requirements: [''],
    includes: {
      videoHours: 0,
      downloadableResources: 0,
      articles: 0,
      codingExercises: 0,
      homework: 0,
    },
    salePrice: 0,
  });

  const [sections, setSections] = useState<SectionInput[]>([
    {
      title: '',
      lessons: [{ title: '', videoUrl: '' }],
    },
  ]);

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (id) {
      // Fetch course data by ID and populate the form
      const fetchCourseData = async () => {
        try {
          const course = await courseService.getCourseById(id);
          course.whatWillLearn = course.course_details[0].what_will_learn;
          course.requirements = course.course_details[0].requirements;
          course.includes = course.course_details[0].includes;
          course.salePrice = course.sale_price;
          course.introVideoUrl = course.intro_video_url;
          
          
          setCourseData(course);
          const sections = course.course_sections.map(
            (section: { title: string; position: number; course_lessons: { title: string; video_url: string }[] }) => ({
              title: section.title,
              position: section.position,
              lessons: section.course_lessons.map((lesson: { title: string; video_url: string }) => ({
                title: lesson.title,
                videoUrl: lesson.video_url
              }))
            })
          );
          setSections(sections);
          setImageUrls(course.course_images.map((image: { image_url: string }) => image.image_url));
        } catch (err) {
          console.error('Error fetching course data:', err);
          setError('Failed to load course data. Please try again.');
        }
      };
      fetchCourseData();
    }
  }, [id]);

  const handleCourseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncludesChange = (name: string, value: number) => {
    setCourseData((prev) => ({
      ...prev,
      includes: { ...prev.includes, [name]: value },
    }));
  };

  const handleArrayInputChange = (
    index: number,
    value: string,
    field: 'whatWillLearn' | 'requirements'
  ) => {
    setCourseData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'whatWillLearn' | 'requirements') => {
    setCourseData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (index: number, field: 'whatWillLearn' | 'requirements') => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSectionChange = (index: number, value: string) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[index] = { ...newSections[index], title: value };
      return newSections;
    });
  };

  const handleLessonChange = (
    sectionIndex: number,
    lessonIndex: number,
    field: string,
    value: string
  ) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].lessons[lessonIndex] = {
        ...newSections[sectionIndex].lessons[lessonIndex],
        [field]: value,
      };
      return newSections;
    });
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { title: '', lessons: [{ title: '', videoUrl: '' }] },
    ]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addLesson = (sectionIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].lessons.push({ title: '', videoUrl: '' });
      return newSections;
    });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter(
        (_, i) => i !== lessonIndex
      );
      return newSections;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('files', files);
    if (files) {
      const newImages = Array.from(files);
      setImages((prev) => [...prev, ...newImages]);

      // Upload images to Supabase
      const uploadedUrls = await Promise.all(
        newImages.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const datetimeTick = new Date().toISOString().split('T')[0];
          const fileNameWithDateTime = `${file.name.split('.')[0]}_${datetimeTick}.${fileExt}`;
          const filePath = `${user!.id}/${fileNameWithDateTime}`;
          const { error } = await supabase.storage
            .from('course-images')
            .upload(filePath, file, {
              upsert: true,
            });

          if (error) {
            console.error('Error uploading image:', error);
            return '';
          }
          const { data: { publicUrl } } = supabase.storage
            .from('course-images')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      setImageUrls((prev) => [...prev, ...uploadedUrls.filter((url) => url)]);
      console.log('imageUrls', imageUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        // Update the course
        await courseService.updateCourse(
          id!, // Assuming id is defined if isEditMode is true
          { 
            ...courseData, 
            instructor_id: user.id 
          }, 
          sections,
          imageUrls
        );
        navigate(`/course/${id}`);
      } else {
        // Create a new course
        const course = await courseService.createCourse(
          { 
            ...courseData, 
            instructor_id: user.id 
          }, 
          sections,
          imageUrls
        );
        navigate(`/course/${course.id}`);
      }
      await updateCreatedCourses(user.id);
    } catch (err) {
      console.error('Error creating or updating course:', err);
      setError('Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Nuevo Curso</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título del Curso</label>
                    <input
                      type="text"
                      name="title"
                      value={courseData.title}
                      onChange={handleCourseInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={courseData.price}
                      onChange={handleCourseInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>&nbsp;</div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio de oferta ($)</label>
                      <input
                        type="number"
                        name="salePrice"
                        value={courseData.salePrice}
                        onChange={handleCourseInputChange}
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleCourseInputChange}
                    rows={4}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Intro Video URL</label>
                  <input
                    type="url"
                    name="introVideoUrl"
                    value={courseData.introVideoUrl}
                    onChange={handleCourseInputChange}
                    placeholder="https://example.com/video"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subir Imágenes</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer border rounded-md p-2"
                  />
                  
                  {imageUrls.length > 0 && (
                    <div className="mt-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        {/* Main Carousel */}
                        <Carousel
                          showThumbs={true}
                          showStatus={false}
                          infiniteLoop={true}
                          showIndicators={true}
                          renderThumbs={(children) =>
                            children.map((item, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={imageUrls[index]}
                                  alt={`Thumbnail ${index + 1}`}
                                  style={thumbnailStyle}
                                  className="rounded transition-opacity group-hover:opacity-80"
                                />
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const newUrls = imageUrls.filter((_, i) => i !== index);
                                    setImageUrls(newUrls);
                                    const newImages = images.filter((_, i) => i !== index);
                                    setImages(newImages);
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove image"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))
                          }
                          thumbWidth={80}
                        >
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Course Image ${index + 1}`}
                                style={carouselImageStyle}
                                className="rounded-lg"
                              />
                            </div>
                          ))}
                        </Carousel>

                        {/* Image Count and Info */}
                        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
                          <span>{imageUrls.length} {imageUrls.length === 1 ? 'imagen subida' : 'imágenes subidas'}</span>
                          <button
                            onClick={() => {
                              setImages([]);
                              setImageUrls([]);
                            }}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Eliminar todas
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What Will Learn */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lo que Aprenderán los Estudiantes</h2>
              <div className="space-y-2">
                {courseData.whatWillLearn.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayInputChange(index, e.target.value, 'whatWillLearn')}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Objetivo de aprendizaje"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'whatWillLearn')}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('whatWillLearn')}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir Objetivo de Aprendizaje
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requisitos del Curso</h2>
              <div className="space-y-2">
                {courseData.requirements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Requisito"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir Requisito
                </button>
              </div>
            </div>

            {/* Course Includes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">El Curso Incluye</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horas de Video</label>
                  <input
                    type="number"
                    value={courseData.includes.videoHours}
                    onChange={(e) => handleIncludesChange('videoHours', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recursos Descargables</label>
                  <input
                    type="number"
                    value={courseData.includes.downloadableResources}
                    onChange={(e) =>
                      handleIncludesChange('downloadableResources', Number(e.target.value))
                    }
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Artículos</label>
                  <input
                    type="number"
                    value={courseData.includes.articles}
                    onChange={(e) => handleIncludesChange('articles', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ejercicios de Codificación</label>
                  <input
                    type="number"
                    value={courseData.includes.codingExercises}
                    onChange={(e) => handleIncludesChange('codingExercises', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tareas</label>
                  <input
                    type="number"
                    value={courseData.includes.homework}
                    onChange={(e) => handleIncludesChange('homework', Number(e.target.value))}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Course Access */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceso al Curso</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasCertificate"
                    checked={courseData.hasCertificate}
                    onChange={(e) =>
                      setCourseData((prev) => ({ ...prev, hasCertificate: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasCertificate" className="ml-2 block text-sm text-gray-700">
                    Incluir Certificado de Finalización
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isLifetimeAccess"
                    checked={courseData.isLifetimeAccess}
                    onChange={(e) =>
                      setCourseData((prev) => ({ ...prev, isLifetimeAccess: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isLifetimeAccess" className="ml-2 block text-sm text-gray-700">
                    Acceso de por Vida
                  </label>
                </div>

                {!courseData.isLifetimeAccess && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duración del Acceso</label>
                    <input
                      type="text"
                      name="accessDuration"
                      value={courseData.accessDuration || ''}
                      onChange={handleCourseInputChange}
                      placeholder="ej., 6 meses"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido del Curso</h2>
              <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
                        placeholder="Título de la Sección"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="ml-2 p-2 text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4 ml-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                handleLessonChange(sectionIndex, lessonIndex, 'title', e.target.value)
                              }
                              placeholder="Título de la Lección"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <input
                              type="url"
                              value={lesson.videoUrl}
                              onChange={(e) =>
                                handleLessonChange(
                                  sectionIndex,
                                  lessonIndex,
                                  'videoUrl',
                                  e.target.value
                                )
                              }
                              placeholder="URL del Video"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLesson(sectionIndex, lessonIndex)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addLesson(sectionIndex)}
                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir Lección
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir Sección
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  isEditMode ? 'Editando Curso...' : 'Creando Curso...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Editar Curso' : 'Crear Curso'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}