import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SpecialCourse } from '../types/specialCourse';
import { User } from '@supabase/supabase-js';

interface CertificateViewProps {
  course: SpecialCourse;
  user: User;
  onBack: () => void;
}

export default function CertificateView({ course, user, onBack }: CertificateViewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 800
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificado-${course.title.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const userName = user.user_metadata?.name || user.email || 'Estudiante';
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center text-white hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          
          <h1 className="text-xl font-bold">Certificado de Finalización</h1>
          
          <button
            onClick={downloadCertificate}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-24 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl w-full"
        >
          {/* Certificate */}
          <div
            ref={certificateRef}
            className="bg-white text-gray-800 p-16 rounded-lg shadow-2xl"
            style={{ aspectRatio: '1.414/1', minHeight: '600px' }}
          >
            {/* Decorative border */}
            <div className="border-8 border-double border-blue-600 h-full p-8 relative">
              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-gold-500"></div>
              <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-gold-500"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-gold-500"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-gold-500"></div>

              <div className="text-center h-full flex flex-col justify-center">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-5xl font-serif font-bold text-blue-800 mb-4">
                    CERTIFICADO
                  </h1>
                  <h2 className="text-2xl font-serif text-gray-600">
                    de Finalización
                  </h2>
                </div>

                {/* Main content */}
                <div className="mb-8">
                  <p className="text-xl mb-6 font-serif">
                    Se certifica que
                  </p>
                  
                  <h3 className="text-4xl font-serif font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-2 inline-block">
                    {userName}
                  </h3>
                  
                  <p className="text-xl mb-4 font-serif">
                    ha completado satisfactoriamente el curso
                  </p>
                  
                  <h4 className="text-2xl font-serif font-bold text-gray-800 mb-8">
                    "{course.title}"
                  </h4>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end mt-auto">
                  <div className="text-left">
                    <p className="text-lg font-serif mb-2">Fecha de finalización:</p>
                    <p className="text-xl font-bold text-blue-800">{currentDate}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-48 border-t-2 border-gray-400 mb-2"></div>
                    <p className="text-lg font-serif">
                      {course.instructor?.name || 'Instructor'}
                    </p>
                    <p className="text-sm text-gray-600">Instructor del Curso</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✓</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Certificado Oficial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Congratulations message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-8"
          >
            <h2 className="text-3xl font-bold mb-4">¡Felicitaciones!</h2>
            <p className="text-xl text-gray-300 mb-6">
              Has completado exitosamente el curso "{course.title}".
            </p>
            <p className="text-lg text-gray-400">
              Puedes descargar tu certificado haciendo clic en el botón "Descargar PDF" arriba.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}