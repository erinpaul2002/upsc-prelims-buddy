interface SetupCardProps {
  totalTime: number;
  setTotalTime: (time: number) => void;
  totalQuestions: number;
  setTotalQuestions: (questions: number) => void;
  startQuiz: () => void;
}

export default function SetupCard({ totalTime, setTotalTime, totalQuestions, setTotalQuestions, startQuiz }: SetupCardProps) {
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