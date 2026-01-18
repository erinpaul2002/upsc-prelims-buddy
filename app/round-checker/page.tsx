'use client';

import { useState } from 'react';

type RoundSelections = Record<number, string>; // questionId -> selected option
type Answers = Record<number, string>; // questionId -> correct option

// Classification categories
type QuestionCategory = 'A1' | 'B1' | 'C1' | 'D1' | 'D2' | 'E1' | 'E2' | 'skipped';

interface QuestionAnalysis {
  category: QuestionCategory;
  label: string;
  description: string;
  color: string;
}

interface AggregateMetrics {
  contentGapIndex: number;
  carelessnessIndex: number;
  eliminationEfficiency: number;
  logicRiskRatio: number;
  strategyDisciplineScore: number;
}

const getCategoryInfo = (category: QuestionCategory): QuestionAnalysis => {
  const categoryMap: Record<QuestionCategory, QuestionAnalysis> = {
    A1: {
      category: 'A1',
      label: 'Content Gap',
      description: 'Not attempted in any round',
      color: 'bg-blue-900 border-blue-700'
    },
    B1: {
      category: 'B1',
      label: 'Carelessness Error',
      description: 'Wrong in Round 1 (high confidence, poor execution)',
      color: 'bg-red-900 border-red-700'
    },
    C1: {
      category: 'C1',
      label: 'Strong Foundation',
      description: 'Correct in Round 1 (solid content + judgment)',
      color: 'bg-green-900 border-green-700'
    },
    D1: {
      category: 'D1',
      label: 'Effective Elimination',
      description: 'Correct in Round 2 (partial knowledge, good elimination)',
      color: 'bg-emerald-900 border-emerald-700'
    },
    D2: {
      category: 'D2',
      label: 'Elimination Flaw',
      description: 'Wrong in Round 2 (incorrect elimination logic)',
      color: 'bg-orange-900 border-orange-700'
    },
    E1: {
      category: 'E1',
      label: 'Logical Mastery',
      description: 'Correct in Round 3 (no content, correct inference)',
      color: 'bg-purple-900 border-purple-700'
    },
    E2: {
      category: 'E2',
      label: 'Logical Error',
      description: 'Wrong in Round 3 (logic unsupported by facts)',
      color: 'bg-pink-900 border-pink-700'
    },
    skipped: {
      category: 'skipped',
      label: 'Skipped',
      description: 'Not attempted',
      color: 'bg-gray-800 border-gray-700'
    }
  };
  return categoryMap[category] || categoryMap.skipped;
};

export default function RoundChecker() {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [currentStep, setCurrentStep] = useState<'setup' | 'rounds' | 'answers' | 'analysis'>('setup');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundSelections, setRoundSelections] = useState<RoundSelections[]>([{}, {}, {}]); // index 0: round1, etc.
  const [answers, setAnswers] = useState<Answers>({});
  const [tempAnswers, setTempAnswers] = useState<Answers>({});

  const handleStartRounds = () => {
    setCurrentStep('rounds');
    setCurrentRound(1);
  };

  const handleRoundSelection = (questionId: number, option: string) => {
    setRoundSelections(prev => {
      const newSelections = [...prev];
      newSelections[currentRound - 1] = { ...newSelections[currentRound - 1], [questionId]: option };
      return newSelections;
    });
  };

  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(prev => prev + 1);
    } else {
      // Move to answers
      setCurrentStep('answers');
      setTempAnswers({ ...answers });
    }
  };

  const handleAnswerChange = (questionId: number, option: string) => {
    setTempAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleConfirmAnswers = () => {
    setAnswers(tempAnswers);
    setCurrentStep('analysis');
  };

  // Classify each question based on algorithm
  const classifyQuestion = (questionId: number): QuestionCategory => {
    const correctAnswer = answers[questionId];
    let firstAttemptRound = -1;
    let finalAnswer = null;

    // Find first attempt round
    for (let i = 0; i < 3; i++) {
      if (roundSelections[i][questionId]) {
        firstAttemptRound = i + 1;
        finalAnswer = roundSelections[i][questionId];
        break;
      }
    }

    // A1: Skipped completely
    if (firstAttemptRound === -1) {
      return 'A1';
    }

    const isCorrect = finalAnswer === correctAnswer;

    // B1: Wrong in Round 1
    if (firstAttemptRound === 1 && !isCorrect) {
      return 'B1';
    }

    // C1: Correct in Round 1
    if (firstAttemptRound === 1 && isCorrect) {
      return 'C1';
    }

    // D1: Correct in Round 2
    if (firstAttemptRound === 2 && isCorrect) {
      return 'D1';
    }

    // D2: Wrong in Round 2
    if (firstAttemptRound === 2 && !isCorrect) {
      return 'D2';
    }

    // E1: Correct in Round 3
    if (firstAttemptRound === 3 && isCorrect) {
      return 'E1';
    }

    // E2: Wrong in Round 3
    if (firstAttemptRound === 3 && !isCorrect) {
      return 'E2';
    }

    return 'skipped';
  };

  const calculateAggregateMetrics = (): AggregateMetrics => {
    const classifications = Array.from({ length: numQuestions }, (_, i) => i + 1)
      .map(q => classifyQuestion(q));

    const stats = {
      A1: classifications.filter(c => c === 'A1').length,
      B1: classifications.filter(c => c === 'B1').length,
      C1: classifications.filter(c => c === 'C1').length,
      D1: classifications.filter(c => c === 'D1').length,
      D2: classifications.filter(c => c === 'D2').length,
      E1: classifications.filter(c => c === 'E1').length,
      E2: classifications.filter(c => c === 'E2').length,
    };

    const totalAttempted = numQuestions - stats.A1;
    const totalWrong = stats.B1 + stats.D2 + stats.E2;
    const totalCorrect = stats.C1 + stats.D1 + stats.E1;

    return {
      contentGapIndex: totalAttempted > 0 ? (stats.A1 / numQuestions) * 100 : 0,
      carelessnessIndex: totalWrong > 0 ? (stats.B1 / totalWrong) * 100 : 0,
      eliminationEfficiency: (stats.D1 + stats.D2) > 0 ? (stats.D1 / (stats.D1 + stats.D2)) * 100 : 0,
      logicRiskRatio: totalAttempted > 0 ? (stats.E2 / totalAttempted) * 100 : 0,
      strategyDisciplineScore: totalCorrect > 0 ? ((stats.C1 + stats.D1) / totalCorrect) * 100 : 0,
    };
  };

  const getOptionClass = (questionId: number, option: string, isAnswerMode = false) => {
    const baseClass = "w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold transition-colors";
    if (isAnswerMode) {
      return tempAnswers[questionId] === option ? `${baseClass} bg-blue-500 text-white border-blue-600` : `${baseClass} bg-gray-700 text-white border-gray-500 hover:bg-gray-600`;
    }
    // For rounds
    const attemptedInPrevious = roundSelections.slice(0, currentRound - 1).some(sel => sel[questionId]);
    if (attemptedInPrevious) {
      return `${baseClass} bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed`;
    }
    const selectedInCurrent = roundSelections[currentRound - 1][questionId] === option;
    if (selectedInCurrent) return `${baseClass} bg-orange-500 text-white border-orange-600`;
    return `${baseClass} bg-gray-700 text-white border-gray-500 hover:bg-gray-600`;
  };

  const renderSetup = () => (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-orange-500">Round Checker</h1>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Number of Questions:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleStartRounds}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Start Rounds
        </button>
      </div>
    </div>
  );

  const renderRounds = () => (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">Round {currentRound}</h1>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {Array.from({ length: numQuestions }, (_, i) => i + 1).map(questionId => (
            <div key={questionId} className={`bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center ${roundSelections.slice(0, currentRound - 1).some(sel => sel[questionId]) ? 'opacity-50 line-through' : ''}`}>
              <span className="text-lg font-semibold text-white mr-6 w-24">Q{questionId}</span>
              <div className="flex space-x-4">
                {['A', 'B', 'C', 'D'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleRoundSelection(questionId, option)}
                    disabled={roundSelections.slice(0, currentRound - 1).some(sel => sel[questionId])}
                    className={getOptionClass(questionId, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleNextRound}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            {currentRound < 3 ? `Finish Round ${currentRound}` : 'Proceed to Answers'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnswers = () => (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">Enter Correct Answers</h1>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {Array.from({ length: numQuestions }, (_, i) => i + 1).map(questionId => (
            <div key={questionId} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center">
              <span className="text-lg font-semibold text-white mr-6 w-24">Q{questionId}</span>
              <div className="flex space-x-4">
                {['A', 'B', 'C', 'D'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange(questionId, option)}
                    className={getOptionClass(questionId, option, true)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleConfirmAnswers}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Confirm Answers
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalysis = () => {
    const metrics = calculateAggregateMetrics();

    const getMetricStatus = (value: number, target: number, isHigherBetter: boolean) => {
      if (isHigherBetter) {
        return value >= target ? 'text-green-400' : 'text-red-400';
      }
      return value <= target ? 'text-green-400' : 'text-red-400';
    };

    const classifications = Array.from({ length: numQuestions }, (_, i) => i + 1)
      .map(q => classifyQuestion(q));

    const categoryBreakdown = {
      A1: classifications.filter(c => c === 'A1').length,
      B1: classifications.filter(c => c === 'B1').length,
      C1: classifications.filter(c => c === 'C1').length,
      D1: classifications.filter(c => c === 'D1').length,
      D2: classifications.filter(c => c === 'D2').length,
      E1: classifications.filter(c => c === 'E1').length,
      E2: classifications.filter(c => c === 'E2').length,
    };

    const getOptionClassAnalysis = (questionId: number, option: string) => {
      const baseClass = "w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold";
      let finalAnswer = null;
      for (let i = 2; i >= 0; i--) {
        if (roundSelections[i][questionId]) {
          finalAnswer = roundSelections[i][questionId];
          break;
        }
      }
      const correctAnswer = answers[questionId];
      const category = classifyQuestion(questionId);

      if (category === 'A1') {
        return option === correctAnswer ? `${baseClass} bg-green-500 text-white border-green-600` : `${baseClass} bg-gray-600 text-gray-400 border-gray-500`;
      }
      if (['C1', 'D1', 'E1'].includes(category)) {
        return option === finalAnswer ? `${baseClass} bg-green-500 text-white border-green-600` : `${baseClass} bg-gray-600 text-gray-400 border-gray-500`;
      }
      // Wrong categories (B1, D2, E2)
      if (option === finalAnswer) return `${baseClass} bg-red-500 text-white border-red-600`;
      if (option === correctAnswer) return `${baseClass} bg-green-500 text-white border-green-600`;
      return `${baseClass} bg-gray-600 text-gray-400 border-gray-500`;
    };

    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">UPSC Prelims Analysis</h1>

          {/* Aggregate Metrics */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Content Gap Index</span>
                  <span className="text-xs text-gray-400">Target: &lt; 15%</span>
                </div>
                <div className={`text-2xl font-bold ${getMetricStatus(metrics.contentGapIndex, 15, false)}`}>
                  {metrics.contentGapIndex.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Carelessness Index</span>
                  <span className="text-xs text-gray-400">Target: &lt; 20%</span>
                </div>
                <div className={`text-2xl font-bold ${getMetricStatus(metrics.carelessnessIndex, 20, false)}`}>
                  {metrics.carelessnessIndex.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Elimination Efficiency</span>
                  <span className="text-xs text-gray-400">Target: ≥ 60%</span>
                </div>
                <div className={`text-2xl font-bold ${getMetricStatus(metrics.eliminationEfficiency, 60, true)}`}>
                  {metrics.eliminationEfficiency.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Logic Risk Ratio</span>
                  <span className="text-xs text-gray-400">Target: ≤ 5%</span>
                </div>
                <div className={`text-2xl font-bold ${getMetricStatus(metrics.logicRiskRatio, 5, false)}`}>
                  {metrics.logicRiskRatio.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Strategy Discipline Score</span>
                  <span className="text-xs text-gray-400">Target: ≥ 75%</span>
                </div>
                <div className={`text-2xl font-bold ${getMetricStatus(metrics.strategyDisciplineScore, 75, true)}`}>
                  {metrics.strategyDisciplineScore.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['A1', 'B1', 'C1', 'D1', 'D2', 'E1', 'E2'] as const).map(cat => {
                const info = getCategoryInfo(cat);
                return (
                  <div key={cat} className={`p-4 rounded-lg border ${info.color}`}>
                    <h3 className="text-lg font-bold mb-1">{info.label}</h3>
                    <div className="text-2xl font-bold text-white mb-2">{categoryBreakdown[cat]}</div>
                    <p className="text-xs text-gray-300">{info.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Question Analysis */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">Question Analysis</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {Array.from({ length: numQuestions }, (_, i) => i + 1).map(questionId => {
                const category = classifyQuestion(questionId);
                const info = getCategoryInfo(category);
                return (
                  <div key={questionId} className={`p-4 rounded-lg border ${info.color} transition-all`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-white">Q{questionId}</span>
                        <div>
                          <div className="font-semibold text-white">{info.label}</div>
                          <div className="text-xs text-gray-300">{info.description}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-12">
                      {['A', 'B', 'C', 'D'].map(option => (
                        <div
                          key={option}
                          className={getOptionClassAnalysis(questionId, option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-400">Key Insights</h2>
            <ul className="space-y-2 text-sm">
              {metrics.carelessnessIndex > 20 && (
                <li className="text-red-400">⚠️ High carelessness in Round 1 — slow down and recheck answers</li>
              )}
              {metrics.contentGapIndex > 15 && (
                <li className="text-red-400">⚠️ Significant content gaps — focus on syllabus revision</li>
              )}
              {metrics.eliminationEfficiency < 60 && (
                <li className="text-red-400">⚠️ Weak elimination skills — practice option-level analysis</li>
              )}
              {metrics.logicRiskRatio > 5 && (
                <li className="text-red-400">⚠️ High Round 3 error rate — reduce risky attempts</li>
              )}
              {metrics.strategyDisciplineScore < 75 && (
                <li className="text-yellow-400">💡 Over-reliance on elimination and logic — strengthen fundamentals</li>
              )}
              {metrics.carelessnessIndex <= 20 && metrics.contentGapIndex <= 15 && metrics.eliminationEfficiency >= 60 && metrics.logicRiskRatio <= 5 && metrics.strategyDisciplineScore >= 75 && (
                <li className="text-green-400">✓ Excellent strategy — marks coming mainly from solid content and planning</li>
              )}
            </ul>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentStep('setup')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Start New Test
            </button>
          </div>
        </div>
      </div>
    );
  };

  switch (currentStep) {
    case 'setup':
      return renderSetup();
    case 'rounds':
      return renderRounds();
    case 'answers':
      return renderAnswers();
    case 'analysis':
      return renderAnalysis();
    default:
      return renderSetup();
  }
}