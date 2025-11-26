'use client';

import { useState, useEffect } from 'react';
import Card from './Card';

interface QuestionCardProps {
  roundQuestions: number[];
  currentQuestionIndex: number;
  currentRound: number;
  answerQuestion: (option: string) => void;
  skipQuestion: () => void;
}

export default function QuestionCard({
  roundQuestions,
  currentQuestionIndex,
  currentRound,
  answerQuestion,
  skipQuestion
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOption(null);
  }, [currentQuestionIndex, currentRound]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setTimeout(() => {
      answerQuestion(option);
    }, 300);
  };

  const getButtonClass = (option: string) => {
    const baseClass = "p-6 rounded-lg text-2xl font-bold transition-colors border border-gray-300";
    if (selectedOption === option) {
      return `${baseClass} bg-orange-500 text-white border-orange-600`;
    }
    return `${baseClass} bg-white text-black hover:bg-gray-100 active:bg-gray-200`;
  };

  return (
    <Card
      top={
        <div className="flex items-center justify-between mb-1">
          <div className="text-4xl font-extrabold text-white">Q. {roundQuestions[currentQuestionIndex]}</div>
          <div className="text-lg font-semibold text-gray-400">{roundQuestions.length - currentQuestionIndex} left</div>
        </div>
      }
      middle={
        <>
          <div className="text-xl font-semibold text-orange-500 mb-4">Round {currentRound}</div>
          <div className="grid grid-cols-2 gap-4">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                className={getButtonClass(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      }
      bottom={
        <button
          onClick={skipQuestion}
          disabled={selectedOption !== null}
          className="w-full bg-orange-500 text-white p-4 rounded-lg text-xl font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors border border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip Question
        </button>
      }
    />
  );
}