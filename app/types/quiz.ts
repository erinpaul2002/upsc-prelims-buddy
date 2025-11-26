export interface ParsedQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string | null;
}

export interface RoundAttempt {
  round: number;
  selectedOption: string;
}

export interface QuizQuestion extends ParsedQuestion {
  answeredRound: number | null;
  skipped: boolean;
  userAnswer: string | null;
  roundAttempts: RoundAttempt[]; // Track all attempts across rounds
}

export interface QuizResults {
  r1: number;
  r2: number;
  r3: number;
  unattempted: number;
  totalTime: number;
  correct: number;
  incorrect: number;
}

export interface ParsedPdfResult {
  text?: string;
  savedToFile?: string;
  structuredQuestions?: ParsedQuestion[];
  error?: string;
}
