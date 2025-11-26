interface RoundAttempt {
  round: number;
  selectedOption: string;
}

interface ResultsCardProps {
  results: { r1: number; r2: number; r3: number; unattempted: number; totalTime: number };
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  questions: { id: number; chosenOption: string | null; skipped: boolean; roundAttempts?: RoundAttempt[] }[];
  formatTime: (seconds: number) => string;
  showAnalysis: boolean;
  setShowAnalysis: (show: boolean) => void;
}

export default function ResultsCard({ results, showDetails, setShowDetails, questions, formatTime, showAnalysis, setShowAnalysis }: ResultsCardProps) {
  // Group questions by the round they were attempted in
  const getQuestionsAttemptedInRound = (round: number) => {
    return questions.filter(q => q.roundAttempts?.some(a => a.round === round));
  };

  const getOptionInRound = (question: typeof questions[0], round: number) => {
    const attempt = question.roundAttempts?.find(a => a.round === round);
    return attempt?.selectedOption || '-';
  };

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
            <span className="text-lg font-medium text-white">Total Time Taken:</span>
            <span className="text-xl font-bold text-orange-400">{formatTime(results.totalTime)}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors border border-blue-600"
          >
            {showDetails ? 'Hide' : 'View'} Marked Options
          </button>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors border border-purple-600"
          >
            {showAnalysis ? 'Hide' : 'Analyze'} Results
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors border border-orange-600"
          >
            Restart Quiz
          </button>
        </div>
        {showDetails && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4 text-orange-500">Marked Options</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map(q => (
                <div key={q.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-600">
                  <span className="text-lg font-medium text-white">Question {q.id}:</span>
                  <span className="text-xl font-bold text-orange-400">
                    {q.chosenOption ? q.chosenOption : q.skipped ? 'Skipped' : 'Unattempted'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {showAnalysis && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Round-by-Round Analysis</h2>
            
            {/* Round 1 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-green-400 border-b border-green-400 pb-2">Round 1 Attempts ({getQuestionsAttemptedInRound(1).length} questions)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getQuestionsAttemptedInRound(1).length === 0 ? (
                  <p className="text-gray-400 italic">No questions attempted in Round 1</p>
                ) : (
                  getQuestionsAttemptedInRound(1).map(q => (
                    <div key={q.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-green-600">
                      <span className="text-lg font-medium text-white">Q{q.id}:</span>
                      <span className="text-xl font-bold text-green-400">
                        {getOptionInRound(q, 1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Round 2 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-yellow-400 border-b border-yellow-400 pb-2">Round 2 Attempts ({getQuestionsAttemptedInRound(2).length} questions)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getQuestionsAttemptedInRound(2).length === 0 ? (
                  <p className="text-gray-400 italic">No questions attempted in Round 2</p>
                ) : (
                  getQuestionsAttemptedInRound(2).map(q => (
                    <div key={q.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-yellow-600">
                      <span className="text-lg font-medium text-white">Q{q.id}:</span>
                      <span className="text-xl font-bold text-yellow-400">
                        {getOptionInRound(q, 2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Round 3 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-red-400 border-b border-red-400 pb-2">Round 3 Attempts ({getQuestionsAttemptedInRound(3).length} questions)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getQuestionsAttemptedInRound(3).length === 0 ? (
                  <p className="text-gray-400 italic">No questions attempted in Round 3</p>
                ) : (
                  getQuestionsAttemptedInRound(3).map(q => (
                    <div key={q.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-red-600">
                      <span className="text-lg font-medium text-white">Q{q.id}:</span>
                      <span className="text-xl font-bold text-red-400">
                        {getOptionInRound(q, 3)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unattempted */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-400 border-b border-gray-400 pb-2">Unattempted ({questions.filter(q => !q.roundAttempts?.length && !q.skipped).length} questions)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {questions.filter(q => !q.roundAttempts?.length && !q.skipped).length === 0 ? (
                  <p className="text-gray-400 italic">All questions were attempted!</p>
                ) : (
                  questions.filter(q => !q.roundAttempts?.length && !q.skipped).map(q => (
                    <div key={q.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-600">
                      <span className="text-lg font-medium text-white">Q{q.id}</span>
                      <span className="text-sm text-gray-400">Not attempted</span>
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