
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Question {
  id: number;
  answeredRound: number | null;
  skipped: boolean;
}

export default function Home() {
  const [totalTime, setTotalTime] = useState(1); // minutes
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState({ r1: 0, r2: 0, r3: 0, unattempted: 0, totalTime: 0 });

  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const finishQuiz = useCallback((lastId?: number, answered?: boolean) => {
    let questionsToUse = questions;
    if (lastId && answered) {
      questionsToUse = questions.map(q => q.id === lastId ? { ...q, answeredRound: currentRound } : q);
    }
    setIsFinished(true);
    setStarted(false);
    const r1 = questionsToUse.filter(q => q.answeredRound === 1).length;
    const r2 = questionsToUse.filter(q => q.answeredRound === 2).length;
    const r3 = questionsToUse.filter(q => q.answeredRound === 3).length;
    const unattempted = questionsToUse.filter(q => q.answeredRound === null).length;
    const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    console.log('Quiz finished. Total questions:', totalQuestions);
    console.log('R1:', r1, 'R2:', r2, 'R3:', r3, 'Unattempted:', unattempted);
    console.log('Total accounted:', r1 + r2 + r3 + unattempted);
    setResults({ r1, r2, r3, unattempted, totalTime: totalTimeTaken });
  }, [questions, currentRound, totalQuestions]);

  useEffect(() => {
    if (started && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!started && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [started, finishQuiz]);

  const startQuiz = () => {
    const q: Question[] = Array.from({ length: totalQuestions }, (_, i) => ({
      id: i + 1,
      answeredRound: null,
      skipped: false,
    }));
    setQuestions(q);
    setRoundQuestions(q.map(q => q.id));
    setTimer(totalTime * 60);
    startTimeRef.current = Date.now();
    setStarted(true);
  };

  const answerQuestion = () => {
    const currentQId = roundQuestions[currentQuestionIndex];
    setQuestions(prev => prev.map(q =>
      q.id === currentQId ? { ...q, answeredRound: currentRound } : q
    ));
    nextQuestion(true);
  };

  const skipQuestion = () => {
    const currentQId = roundQuestions[currentQuestionIndex];
    setQuestions(prev => prev.map(q =>
      q.id === currentQId ? { ...q, skipped: true } : q
    ));
    nextQuestion(false);
  };

  const nextQuestion = (answered: boolean) => {
    if (currentQuestionIndex < roundQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      nextRound(answered);
    }
  };

  const nextRound = (answered: boolean) => {
    if (currentRound < 3) {
      const currentQId = roundQuestions[currentQuestionIndex];
      const nextRoundQs = questions.filter(q => q.answeredRound === null && (answered ? q.id !== currentQId : true)).map(q => q.id);
      console.log('Next round. Current round:', currentRound, 'Answered:', answered, 'Unanswered questions:', nextRoundQs.length);
      if (nextRoundQs.length > 0) {
        setCurrentRound(prev => prev + 1);
        setRoundQuestions(nextRoundQs);
        setCurrentQuestionIndex(0);
      } else {
        finishQuiz(currentQId, answered);
      }
    } else {
      finishQuiz();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-black p-8 rounded-lg shadow-lg text-center max-w-lg w-full border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-orange-500">Quiz Results</h1>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Attempted in Round 1:</span>
              <span className="text-xl font-bold text-orange-400">{results.r1}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Attempted in Round 2:</span>
              <span className="text-xl font-bold text-orange-400">{results.r2}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Attempted in Round 3:</span>
              <span className="text-xl font-bold text-orange-400">{results.r3}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Unattempted:</span>
              <span className="text-xl font-bold text-red-400">{results.unattempted}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Total Time Taken:</span>
              <span className="text-xl font-bold text-orange-400">{formatTime(results.totalTime)}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors border border-orange-600"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-black p-10 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">UPSC Prelims MCQ Practice</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Total Time (minutes):</label>
              <input
                type="number"
                value={totalTime}
                onChange={(e) => setTotalTime(Number(e.target.value))}
                placeholder="e.g., 1"
                className="w-full p-3 rounded-lg bg-white text-black border border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Total Questions:</label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                placeholder="e.g., 5"
                className="w-full p-3 rounded-lg bg-white text-black border border-gray-300 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={startQuiz}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-orange-600 transition-colors border border-orange-600"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-white mb-4 border-2 border-gray-600 rounded-lg p-4 bg-gray-900">{formatTime(timer)}</div>
          <div className="text-xl font-semibold text-orange-500 mb-1">Round {currentRound}</div>
          <div className="text-lg text-gray-300">Question {currentQuestionIndex + 1} of {roundQuestions.length}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={answerQuestion}
            className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
          >
            A
          </button>
          <button
            onClick={answerQuestion}
            className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
          >
            B
          </button>
          <button
            onClick={answerQuestion}
            className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
          >
            C
          </button>
          <button
            onClick={answerQuestion}
            className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
          >
            D
          </button>
        </div>
        <button
          onClick={skipQuestion}
          className="w-full bg-orange-500 text-white p-4 rounded-lg text-xl font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors border border-orange-600"
        >
          Skip Question
        </button>
      </div>
    </div>
  );
}
