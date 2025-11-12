import Card from './Card';

interface RoundCardProps {
  currentRound: number;
  setShowRoundCard: (show: boolean) => void;
}

export default function RoundCard({ currentRound, setShowRoundCard }: RoundCardProps) {
  return (
    <Card
      top={
        <div className="flex items-center justify-between mb-1">
          <div className="text-4xl font-extrabold text-white"></div>
          <div className="text-lg font-semibold text-gray-400"></div>
        </div>
      }
      middle={
        <div className="text-5xl font-extrabold text-orange-500 text-center">Round {currentRound}</div>
      }
      bottom={
        <button
          onClick={() => setShowRoundCard(false)}
          className="w-full bg-orange-500 text-white p-4 rounded-lg text-xl font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors border border-orange-600"
        >
          Start Round
        </button>
      }
    />
  );
}