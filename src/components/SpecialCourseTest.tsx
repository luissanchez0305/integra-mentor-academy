import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { specialCourseService } from '../services/specialCourseService';
import { useAuth } from '../contexts/AuthContext';
import { SpecialCourse, SpecialCourseTest as SpecialCourseTestType } from '../types/specialCourse';

interface SpecialCourseTestProps {
  test: SpecialCourseTestType;
  course: SpecialCourse;
  onComplete: () => void;
  onBack: () => void;
}

export default function SpecialCourseTest({ test, course, onComplete, onBack }: SpecialCourseTestProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitTest();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitTest = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await specialCourseService.submitTestResult(
        user.id,
        test.id,
        course.id,
        answers,
        test.questions
      );
      setTestResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (testResult?.passed) {
      onComplete();
    } else {
      // Reset test for retry
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setTestResult(null);
    }
  };

  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center"
        >
          <div className="mb-6">
            {testResult.passed ? (
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            )}
            
            <h2 className="text-3xl font-bold mb-4">
              {testResult.passed ? '¡Felicitaciones!' : 'Necesitas mejorar'}
            </h2>
            
            <div className="text-xl mb-6">
              Puntuación: {testResult.score}% ({testResult.correct_answers}/{testResult.total_questions})
            </div>
            
            <p className="text-gray-300 mb-8">
              {testResult.passed 
                ? 'Has aprobado el examen. Puedes continuar con el siguiente módulo.'
                : 'Necesitas al menos 70% para aprobar. Puedes intentar nuevamente.'
              }
            </p>
          </div>

          <div className="space-y-4">
            {test.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct_answer;
              
              return (
                <div key={question.id} className="text-left bg-white bg-opacity-5 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{question.question_text}</p>
                      <p className="text-sm text-gray-300">
                        Tu respuesta: {question.options[userAnswer]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-300">
                          Respuesta correcta: {question.options[question.correct_answer]}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-blue-300 mt-2">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={onBack}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </button>
            <button
              onClick={handleContinue}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                testResult.passed 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {testResult.passed ? 'Continuar' : 'Intentar de nuevo'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          
          <div className="text-center">
            <h1 className="text-xl font-bold">{test.title}</h1>
            <div className="text-sm text-gray-300">
              Pregunta {currentQuestionIndex + 1} de {test.questions.length}
            </div>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main content */}
      <div className="pt-24 min-h-screen flex items-center justify-center p-4">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="max-w-3xl w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question_text}</h2>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-gray-600 bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {answers[currentQuestion.id] === index && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Anterior
            </button>

            <div className="text-sm text-gray-300">
              {Object.keys(answers).length} de {test.questions.length} respondidas
            </div>

            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent || loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Enviando...'
              ) : isLastQuestion ? (
                'Finalizar Examen'
              ) : (
                'Siguiente'
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
}