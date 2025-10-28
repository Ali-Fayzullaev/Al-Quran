'use client';

import { useState } from 'react';
import { QuizConfiguration } from '@/components/quiz/QuizConfiguration';
import { Quiz } from '@/components/quiz/Quiz';
import { QuizResults } from '@/components/quiz/QuizResults';
import { useQuizStore } from '@/lib/quizStore';
import { generateQuizQuestions } from '@/lib/quizGenerator';
import type { QuizConfig } from '@/lib/quizTypes';

type QuizPhase = 'config' | 'quiz' | 'results';

export default function QuizPage() {
  const [phase, setPhase] = useState<QuizPhase>('config');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    setConfig,
    startQuiz,
    resetQuiz,
    currentResult,
    isQuizActive,
  } = useQuizStore();
  
  const handleStartQuiz = async (config: QuizConfig) => {
    try {
      setIsGenerating(true);
      setConfig(config);
      
      // Generate questions based on configuration
      const questions = await generateQuizQuestions(config);
      
      if (questions.length === 0) {
        throw new Error('Failed to generate questions');
      }
      
      startQuiz(questions);
      setPhase('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRetry = () => {
    resetQuiz();
    setPhase('config');
  };
  
  const handleHome = () => {
    resetQuiz();
    setPhase('config');
    window.location.href = '/';
  };
  
  // Check if quiz is finished
  if (!isQuizActive && currentResult && phase === 'quiz') {
    setPhase('results');
  }
  
  return (
    <div className="min-h-screen">
      {phase === 'config' && (
        <QuizConfiguration
          onStart={handleStartQuiz}
          isLoading={isGenerating}
        />
      )}
      
      {phase === 'quiz' && <Quiz />}
      
      {phase === 'results' && currentResult && (
        <QuizResults
          result={currentResult}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
