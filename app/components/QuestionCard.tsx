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
            <button
              onClick={() => answerQuestion('A')}
              className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
            >
              A
            </button>
            <button
              onClick={() => answerQuestion('B')}
              className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
            >
              B
            </button>
            <button
              onClick={() => answerQuestion('C')}
              className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
            >
              C
            </button>
            <button
              onClick={() => answerQuestion('D')}
              className="bg-white text-black p-6 rounded-lg text-2xl font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300"
            >
              D
            </button>
          </div>
        </>
      }
      bottom={
        <button
          onClick={skipQuestion}
          className="w-full bg-orange-500 text-white p-4 rounded-lg text-xl font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors border border-orange-600"
        >
          Skip Question
        </button>
      }
    />
  );
}