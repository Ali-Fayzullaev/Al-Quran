'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen" style={{ 
      backgroundColor: 'var(--fixed-background)',
      color: 'var(--fixed-text)'
    }}>
      <AnimatePresence mode="wait">
        {phase === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <QuizConfiguration
              onStart={handleStartQuiz}
              isLoading={isGenerating}
            />
          </motion.div>
        )}
        
        {phase === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Quiz />
          </motion.div>
        )}
        
        {phase === 'results' && currentResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuizResults
              result={currentResult}
              onRetry={handleRetry}
              onHome={handleHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
