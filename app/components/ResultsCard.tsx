interface ResultsCardProps {
  results: { r1: number; r2: number; r3: number; unattempted: number; totalTime: number };
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  questions: { id: number; chosenOption: string | null; skipped: boolean }[];
  formatTime: (seconds: number) => string;
}

export default function ResultsCard({ results, showDetails, setShowDetails, questions, formatTime }: ResultsCardProps) {
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
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors border border-blue-600"
          >
            {showDetails ? 'Hide' : 'View'} Marked Options
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
      </div>
    </div>
  );
}