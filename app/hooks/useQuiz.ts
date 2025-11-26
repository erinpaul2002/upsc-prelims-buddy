import { useState, useRef, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { ParsedQuestion, QuizQuestion, QuizResults } from '../types/quiz';
import {
  initializeQuizQuestions,
  markQuestionAnswered,
  markQuestionSkipped,
  calculateResults,
  getQuestionById,
  getNextRoundQuestions
} from '../lib/quizLogic';

interface UseQuizOptions {
  totalTime: number; // in minutes
  maxQuestions?: number;
}

interface UseQuizReturn {
  // State
  questions: QuizQuestion[];
  currentRound: number;
  roundQuestions: number[];
  currentQuestionIndex: number;
  timer: number;
  isFinished: boolean;
  isStarted: boolean;
  results: QuizResults | null;
  
  // Current question helpers
  currentQuestion: QuizQuestion | undefined;
  questionsLeftInRound: number;
  
  // Actions
  startQuiz: (parsedQuestions: ParsedQuestion[]) => void;
  answerQuestion: (answer: string) => void;
  skipQuestion: () => void;
  resetQuiz: () => void;
  updateAnswerKey: (key: Record<number, string>) => void;
  
  // Time helpers
  formatTime: (seconds: number) => string;
}

export function useQuiz({ totalTime, maxQuestions }: UseQuizOptions): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const finishQuiz = useCallback((questionsState: QuizQuestion[]) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsFinished(true);
    setIsStarted(false);
    const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const quizResults = calculateResults(questionsState, totalTimeTaken);
    setResults(quizResults);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isStarted && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setQuestions(currentQuestions => {
              finishQuiz(currentQuestions);
              return currentQuestions;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStarted, finishQuiz]);

  const startQuiz = useCallback((parsedQuestions: ParsedQuestion[]) => {
    const quizQuestions = initializeQuizQuestions(parsedQuestions, maxQuestions);
    console.log('Initialized quiz questions:', quizQuestions.length);
    setQuestions(quizQuestions);
    setRoundQuestions(quizQuestions.map(q => q.id));
    console.log('Round questions:', quizQuestions.map(q => q.id));
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setTimer(totalTime * 60);
    setIsFinished(false);
    setResults(null);
    startTimeRef.current = Date.now();
    setIsStarted(true);
  }, [totalTime, maxQuestions]);

  const moveToNextQuestion = useCallback((answered: boolean, updatedQuestions: QuizQuestion[]) => {
    console.log('moveToNextQuestion called:', {
      currentQuestionIndex,
      roundQuestionsLength: roundQuestions.length,
      currentRound,
      answered
    });
    
    const currentQId = roundQuestions[currentQuestionIndex];
    
    if (currentQuestionIndex < roundQuestions.length - 1) {
      // More questions in current round
      console.log('Moving to next question in round');
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of round
      console.log('End of round, calculating next round');
      if (currentRound < 3) {
        const nextRoundQs = getNextRoundQuestions(updatedQuestions, currentQId, answered);
        console.log('Next round questions:', nextRoundQs);
        if (nextRoundQs.length > 0) {
          setCurrentRound(prev => prev + 1);
          setRoundQuestions(nextRoundQs);
          setCurrentQuestionIndex(0);
        } else {
          finishQuiz(updatedQuestions);
        }
      } else {
        finishQuiz(updatedQuestions);
      }
    }
  }, [currentQuestionIndex, roundQuestions, currentRound, finishQuiz]);

  const answerQuestion = useCallback((answer: string) => {
    console.log('answerQuestion called with:', answer);
    const currentQId = roundQuestions[currentQuestionIndex];
    console.log('Answering question ID:', currentQId, 'at index:', currentQuestionIndex);
    
    let updatedQuestions: QuizQuestion[] = [];
    flushSync(() => {
      setQuestions(prev => {
        updatedQuestions = markQuestionAnswered(prev, currentQId, currentRound, answer);
        return updatedQuestions;
      });
    });
    
    moveToNextQuestion(true, updatedQuestions);
  }, [roundQuestions, currentQuestionIndex, currentRound, moveToNextQuestion]);

  const skipQuestion = useCallback(() => {
    const currentQId = roundQuestions[currentQuestionIndex];
    
    let updatedQuestions: QuizQuestion[] = [];
    flushSync(() => {
      setQuestions(prev => {
        updatedQuestions = markQuestionSkipped(prev, currentQId);
        return updatedQuestions;
      });
    });
    
    moveToNextQuestion(false, updatedQuestions);
  }, [roundQuestions, currentQuestionIndex, moveToNextQuestion]);

  const resetQuiz = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setQuestions([]);
    setCurrentRound(1);
    setRoundQuestions([]);
    setCurrentQuestionIndex(0);
    setTimer(0);
    setIsFinished(false);
    setIsStarted(false);
    setResults(null);
  }, []);

  const updateAnswerKey = useCallback((key: Record<number, string>) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = prevQuestions.map(q => ({
        ...q,
        answer: key[q.id] || q.answer
      }));
      
      // If quiz is finished, recalculate results immediately
      // We need to do this inside the effect or use a ref for isFinished/results if we want to be safe,
      // but since this is a user action, we can just check the current state values if we include them in deps
      return updatedQuestions;
    });
  }, []);

  // Effect to recalculate results when questions change if finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      // We need the total time. If we have previous results, use that.
      // Otherwise calculate from start time (but that might be reset).
      // Best to store totalTime in a ref or state separate from results?
      // Or just use the existing results.totalTime if available.
      
      setResults(prevResults => {
        if (!prevResults) return null;
        return calculateResults(questions, prevResults.totalTime);
      });
    }
  }, [questions, isFinished]);

  const currentQuestion = roundQuestions.length > 0 
    ? getQuestionById(questions, roundQuestions[currentQuestionIndex])
    : undefined;

  const questionsLeftInRound = roundQuestions.length - currentQuestionIndex;

  return {
    questions,
    currentRound,
    roundQuestions,
    currentQuestionIndex,
    timer,
    isFinished,
    isStarted,
    results,
    currentQuestion,
    questionsLeftInRound,
    startQuiz,
    answerQuestion,
    skipQuestion,
    resetQuiz,
    updateAnswerKey,
    formatTime
  };
}
