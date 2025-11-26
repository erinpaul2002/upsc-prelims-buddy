
'use client';

import { useState, useEffect } from 'react';
import { useQuiz } from './hooks/useQuiz';
import { usePdfParser } from './hooks/usePdfParser';

export default function Home() {
  const [totalTime, setTotalTime] = useState(1); // minutes
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  const [tempAnswerKey, setTempAnswerKey] = useState<Record<number, string>>({});

  const {
    currentRound,
    roundQuestions,
    currentQuestionIndex,
    timer,
    isFinished,
    isStarted,
    results,
    currentQuestion,
    questionsLeftInRound,
    questions,
    startQuiz,
    answerQuestion,
    skipQuestion,
    resetQuiz,
    updateAnswerKey,
    formatTime
  } = useQuiz({ totalTime });

  const {
    isParsing,
    error: parseError,
    parseFromFile
  } = usePdfParser();

  // Load saved files on mount
  useEffect(() => {
    // No longer needed since we removed saved files functionality
  }, []);

  const handleStartQuiz = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    console.log('Starting quiz with PDF file:', pdfFile.name);
    const questions = await parseFromFile(pdfFile);
    console.log('Questions returned from parseFromFile:', questions.length);
    console.log('Questions array:', questions);
    
    if (questions.length > 0) {
      console.log('Starting quiz with', questions.length, 'questions');
      startQuiz(questions);
    } else {
      console.error('No valid questions found. Questions array is empty or invalid');
      alert('No valid questions found in the PDF. Please check the PDF format.');
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    setIsTransitioning(true);
    setTransitionMessage('Response Recorded');

    setTimeout(() => {
      answerQuestion(option);
      setSelectedOption(null);
      setIsTransitioning(false);
    }, 500);
  };

  const handleSkipQuestion = () => {
    setIsTransitioning(true);
    setTransitionMessage('Skipped');

    setTimeout(() => {
      skipQuestion();
      setIsTransitioning(false);
    }, 500);
  };

  const getButtonClass = (option: string) => {
    const baseClass = "p-4 rounded-lg text-left font-medium transition-colors border border-gray-300";
    if (selectedOption === option) {
      return `${baseClass} bg-orange-500 text-white border-orange-600`;
    }
    return `${baseClass} bg-white text-black hover:bg-gray-100 active:bg-gray-200`;
  };

  // Helper functions for analysis
  const getQuestionsAttemptedInRound = (round: number) => {
    return questions.filter(q => q.roundAttempts?.some(a => a.round === round));
  };

  const getOptionInRound = (question: typeof questions[0], round: number) => {
    const attempt = question.roundAttempts?.find(a => a.round === round);
    return attempt?.selectedOption || '-';
  };

  const handleOpenAnswerKeyModal = () => {
    const currentKeys: Record<number, string> = {};
    questions.forEach(q => {
      if (q.answer) {
        currentKeys[q.id] = q.answer;
      }
    });
    setTempAnswerKey(currentKeys);
    setShowAnswerKeyModal(true);
  };

  const handleSaveAnswerKey = () => {
    updateAnswerKey(tempAnswerKey);
    setShowAnswerKeyModal(false);
  };

  // Results screen
  if (isFinished && results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-black p-8 rounded-lg shadow-lg text-center max-w-2xl w-full border border-gray-700">
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
              <span className="text-lg font-medium text-white">Correct Answers:</span>
              <span className="text-xl font-bold text-green-400">{results.correct}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Incorrect Answers:</span>
              <span className="text-xl font-bold text-red-400">{results.incorrect}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
              <span className="text-lg font-medium text-white">Total Time Taken:</span>
              <span className="text-xl font-bold text-orange-400">{formatTime(results.totalTime)}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors border border-purple-600"
            >
              {showAnalysis ? 'Hide' : 'Analyze'} Results
            </button>
            <button
              onClick={handleOpenAnswerKeyModal}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors border border-blue-600"
            >
              Add Answer Key
            </button>
            <button
              onClick={() => {
                resetQuiz();
                setPdfFile(null);
                setShowAnalysis(false);
              }}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors border border-orange-600"
            >
              Start New Quiz
            </button>
          </div>

          {showAnswerKeyModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Answer Key</h2>
                  <button 
                    onClick={() => setShowAnswerKeyModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white">Q{q.id}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{q.question}</p>
                        <div className="flex gap-4">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={tempAnswerKey[q.id] === opt}
                                onChange={() => setTempAnswerKey(prev => ({ ...prev, [q.id]: opt }))}
                                className="w-4 h-4 text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                              />
                              <span className={`font-medium ${tempAnswerKey[q.id] === opt ? 'text-blue-400' : 'text-gray-400'}`}>
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAnswerKeyModal(false)}
                    className="px-6 py-2 rounded-lg font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAnswerKey}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Save Answer Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAnalysis && (
            <div className="mt-6 text-left">
              <h2 className="text-2xl font-bold mb-4 text-purple-400 text-center">Round-by-Round Analysis</h2>
              
              {/* Round 1 */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-purple-400 border-b border-purple-400 pb-2">
                  Round 1 Attempts ({getQuestionsAttemptedInRound(1).length} questions)
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {getQuestionsAttemptedInRound(1).length === 0 ? (
                    <p className="text-gray-400 italic">No questions attempted in Round 1</p>
                  ) : (
                    getQuestionsAttemptedInRound(1).map(q => (
                      <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-purple-600">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-lg font-bold text-white">Q{q.id}</span>
                          <span className="px-3 py-1 rounded bg-purple-900/50 text-purple-400 font-bold border border-purple-700">
                            Selected: {getOptionInRound(q, 1)}
                          </span>
                        </div>
                        <p className="text-gray-200 mb-4 text-sm">{q.question}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isSelected = getOptionInRound(q, 1) === letter;
                            const isCorrect = q.answer === letter;
                            const hasAnswerKey = !!q.answer;
                            
                            let styleClass = 'bg-gray-700/30 border-gray-700';
                            let textClass = 'text-gray-500';
                            let contentClass = 'text-gray-300';
                            
                            if (hasAnswerKey) {
                              if (isCorrect) {
                                styleClass = 'bg-green-900/30 border-green-500';
                                textClass = 'text-green-400';
                                contentClass = 'text-green-100';
                              } else if (isSelected) {
                                styleClass = 'bg-red-900/30 border-red-500';
                                textClass = 'text-red-400';
                                contentClass = 'text-red-100';
                              }
                            } else if (isSelected) {
                              styleClass = 'bg-blue-900/30 border-blue-500';
                              textClass = 'text-blue-400';
                              contentClass = 'text-blue-100';
                            }

                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded flex items-start gap-3 border ${styleClass}`}
                              >
                                <span className={`font-bold ${textClass}`}>
                                  {letter}.
                                </span>
                                <span className={`text-sm flex-1 ${contentClass}`}>
                                  {opt}
                                </span>
                                {hasAnswerKey && isCorrect && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Correct
                                  </span>
                                )}
                                {hasAnswerKey && isSelected && !isCorrect && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Incorrect
                                  </span>
                                )}
                                {!hasAnswerKey && isSelected && (
                                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Selected
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Round 2 */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-orange-400 border-b border-orange-400 pb-2">
                  Round 2 Attempts ({getQuestionsAttemptedInRound(2).length} questions)
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {getQuestionsAttemptedInRound(2).length === 0 ? (
                    <p className="text-gray-400 italic">No questions attempted in Round 2</p>
                  ) : (
                    getQuestionsAttemptedInRound(2).map(q => (
                      <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-orange-600">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-lg font-bold text-white">Q{q.id}</span>
                          <span className="px-3 py-1 rounded bg-orange-900/50 text-orange-400 font-bold border border-orange-700">
                            Selected: {getOptionInRound(q, 2)}
                          </span>
                        </div>
                        <p className="text-gray-200 mb-4 text-sm">{q.question}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isSelected = getOptionInRound(q, 2) === letter;
                            const isCorrect = q.answer === letter;
                            const hasAnswerKey = !!q.answer;
                            
                            let styleClass = 'bg-gray-700/30 border-gray-700';
                            let textClass = 'text-gray-500';
                            let contentClass = 'text-gray-300';
                            
                            if (hasAnswerKey) {
                              if (isCorrect) {
                                styleClass = 'bg-green-900/30 border-green-500';
                                textClass = 'text-green-400';
                                contentClass = 'text-green-100';
                              } else if (isSelected) {
                                styleClass = 'bg-red-900/30 border-red-500';
                                textClass = 'text-red-400';
                                contentClass = 'text-red-100';
                              }
                            } else if (isSelected) {
                              styleClass = 'bg-blue-900/30 border-blue-500';
                              textClass = 'text-blue-400';
                              contentClass = 'text-blue-100';
                            }

                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded flex items-start gap-3 border ${styleClass}`}
                              >
                                <span className={`font-bold ${textClass}`}>
                                  {letter}.
                                </span>
                                <span className={`text-sm flex-1 ${contentClass}`}>
                                  {opt}
                                </span>
                                {hasAnswerKey && isCorrect && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Correct
                                  </span>
                                )}
                                {hasAnswerKey && isSelected && !isCorrect && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Incorrect
                                  </span>
                                )}
                                {!hasAnswerKey && isSelected && (
                                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Selected
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Round 3 */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-cyan-400 border-b border-cyan-400 pb-2">
                  Round 3 Attempts ({getQuestionsAttemptedInRound(3).length} questions)
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {getQuestionsAttemptedInRound(3).length === 0 ? (
                    <p className="text-gray-400 italic">No questions attempted in Round 3</p>
                  ) : (
                    getQuestionsAttemptedInRound(3).map(q => (
                      <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-cyan-600">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-lg font-bold text-white">Q{q.id}</span>
                          <span className="px-3 py-1 rounded bg-cyan-900/50 text-cyan-400 font-bold border border-cyan-700">
                            Selected: {getOptionInRound(q, 3)}
                          </span>
                        </div>
                        <p className="text-gray-200 mb-4 text-sm">{q.question}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isSelected = getOptionInRound(q, 3) === letter;
                            const isCorrect = q.answer === letter;
                            const hasAnswerKey = !!q.answer;
                            
                            let styleClass = 'bg-gray-700/30 border-gray-700';
                            let textClass = 'text-gray-500';
                            let contentClass = 'text-gray-300';
                            
                            if (hasAnswerKey) {
                              if (isCorrect) {
                                styleClass = 'bg-green-900/30 border-green-500';
                                textClass = 'text-green-400';
                                contentClass = 'text-green-100';
                              } else if (isSelected) {
                                styleClass = 'bg-red-900/30 border-red-500';
                                textClass = 'text-red-400';
                                contentClass = 'text-red-100';
                              }
                            } else if (isSelected) {
                              styleClass = 'bg-blue-900/30 border-blue-500';
                              textClass = 'text-blue-400';
                              contentClass = 'text-blue-100';
                            }

                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded flex items-start gap-3 border ${styleClass}`}
                              >
                                <span className={`font-bold ${textClass}`}>
                                  {letter}.
                                </span>
                                <span className={`text-sm flex-1 ${contentClass}`}>
                                  {opt}
                                </span>
                                {hasAnswerKey && isCorrect && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Correct
                                  </span>
                                )}
                                {hasAnswerKey && isSelected && !isCorrect && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Incorrect
                                  </span>
                                )}
                                {!hasAnswerKey && isSelected && (
                                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Selected
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Unattempted */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-400 border-b border-gray-400 pb-2">
                  Unattempted ({questions.filter(q => q.answeredRound === null).length} questions)
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {questions.filter(q => q.answeredRound === null).length === 0 ? (
                    <p className="text-gray-400 italic">All questions were attempted!</p>
                  ) : (
                    questions.filter(q => q.answeredRound === null).map(q => (
                      <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-lg font-bold text-white">Q{q.id}</span>
                          <span className="px-3 py-1 rounded bg-gray-700 text-gray-400 font-bold border border-gray-600">
                            Not Attempted
                          </span>
                        </div>
                        <p className="text-gray-200 mb-4 text-sm">{q.question}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isCorrect = q.answer === letter;
                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded flex items-start gap-3 border ${
                                  isCorrect
                                    ? 'bg-blue-900/30 border-blue-500'
                                    : 'bg-gray-700/30 border-gray-700'
                                }`}
                              >
                                <span className={`font-bold ${isCorrect ? 'text-blue-400' : 'text-gray-500'}`}>
                                  {letter}.
                                </span>
                                <span className={`text-sm flex-1 ${isCorrect ? 'text-blue-100' : 'text-gray-300'}`}>
                                  {opt}
                                </span>
                                {isCorrect && (
                                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Setup screen
  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-black p-10 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">UPSC Prelims MCQ Practice</h1>
          <div className="space-y-6">
            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Upload PDF with Questions:</label>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="w-full p-3 rounded-lg bg-white text-black border border-gray-300 focus:border-orange-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>

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

            {parseError && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                {parseError}
              </div>
            )}

            <button
              onClick={handleStartQuiz}
              disabled={isParsing || !pdfFile}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-orange-600 transition-colors border border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? 'Parsing PDF...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      {isTransitioning ? (
        <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700 flex flex-col items-center justify-center min-h-[500px]">
          <div className="text-3xl font-bold text-orange-500 animate-pulse">{transitionMessage}</div>
        </div>
      ) : (
        <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700 min-h-[500px] flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white mb-3 border-2 border-gray-600 rounded-lg p-3 bg-gray-900 inline-block">
              {formatTime(timer)}
            </div>
            <div className="text-xl font-semibold text-orange-500 mb-1">Round {currentRound}</div>
            <div className="text-lg text-gray-300">
              Question {currentQuestionIndex + 1} of {roundQuestions.length} ({questionsLeftInRound} left)
            </div>
          </div>
          
          {/* Question */}
          {currentQuestion && (
            <>
              <div className="mb-6">
                <div className="text-lg font-medium text-white mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <span className="text-orange-400 font-bold">Q{currentQuestion.id}.</span> {currentQuestion.question}
                </div>
              </div>
              
              {/* Options */}
              <div className="grid grid-cols-1 gap-3 mb-6 flex-1">
                {currentQuestion.options?.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(optionLetter)}
                      disabled={selectedOption !== null}
                      className={getButtonClass(optionLetter)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          
          {/* Skip Button */}
          <button
            onClick={handleSkipQuestion}
            disabled={selectedOption !== null}
            className="w-full bg-orange-500 text-white p-4 rounded-lg text-xl font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors border border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip Question
          </button>
        </div>
      )}
    </div>
  );
}
