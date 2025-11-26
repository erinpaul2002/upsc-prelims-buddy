import { ParsedQuestion, QuizQuestion, QuizResults } from '../types/quiz';

export function initializeQuizQuestions(
  parsedQuestions: ParsedQuestion[],
  maxQuestions?: number
): QuizQuestion[] {
  console.log('initializeQuizQuestions called with:', parsedQuestions.length, 'questions');
  console.log('Sample parsed question:', parsedQuestions[0]);
  
  // Filter out invalid questions
  const validQuestions = parsedQuestions.filter(q => 
    q.question && 
    q.question.trim().length > 0 && 
    q.options && 
    Array.isArray(q.options) && 
    q.options.length >= 2
  );
  
  console.log('Total parsed questions:', parsedQuestions.length);
  console.log('Valid questions after filtering:', validQuestions.length);
  console.log('Invalid questions filtered out:', parsedQuestions.length - validQuestions.length);

  if (validQuestions.length === 0) {
    console.error('No valid questions found after filtering. Parsed questions:', parsedQuestions);
  }

  const numQuestions = maxQuestions 
    ? Math.min(maxQuestions, validQuestions.length) 
    : validQuestions.length;
  
  return validQuestions.slice(0, numQuestions).map((pq, index) => ({
    ...pq,
    id: index + 1,
    answeredRound: null,
    skipped: false,
    userAnswer: null,
    roundAttempts: []
  }));
}

export function getUnansweredQuestions(questions: QuizQuestion[]): number[] {
  return questions
    .filter(q => q.answeredRound === null)
    .map(q => q.id);
}

export function markQuestionAnswered(
  questions: QuizQuestion[],
  questionId: number,
  round: number,
  userAnswer: string
): QuizQuestion[] {
  return questions.map(q =>
    q.id === questionId
      ? { 
          ...q, 
          answeredRound: round, 
          userAnswer,
          roundAttempts: [...q.roundAttempts, { round, selectedOption: userAnswer }]
        }
      : q
  );
}

export function markQuestionSkipped(
  questions: QuizQuestion[],
  questionId: number
): QuizQuestion[] {
  return questions.map(q =>
    q.id === questionId
      ? { ...q, skipped: true }
      : q
  );
}

export function calculateResults(
  questions: QuizQuestion[],
  totalTimeTaken: number
): QuizResults {
  const r1 = questions.filter(q => q.answeredRound === 1).length;
  const r2 = questions.filter(q => q.answeredRound === 2).length;
  const r3 = questions.filter(q => q.answeredRound === 3).length;
  const unattempted = questions.filter(q => q.answeredRound === null).length;
  
  // Calculate correct/incorrect for questions with known answers
  const answered = questions.filter(q => q.answeredRound !== null && q.userAnswer !== null);
  const correct = answered.filter(q => 
    q.answer !== null && q.userAnswer === q.answer
  ).length;
  const incorrect = answered.filter(q => 
    q.answer !== null && q.userAnswer !== q.answer
  ).length;

  return { r1, r2, r3, unattempted, totalTime: totalTimeTaken, correct, incorrect };
}

export function getQuestionById(questions: QuizQuestion[], id: number): QuizQuestion | undefined {
  return questions.find(q => q.id === id);
}

export function shouldEndQuiz(
  questions: QuizQuestion[],
  currentRound: number
): boolean {
  const unanswered = getUnansweredQuestions(questions);
  return unanswered.length === 0 || currentRound > 3;
}

export function getNextRoundQuestions(
  questions: QuizQuestion[],
  currentQuestionId: number,
  wasAnswered: boolean
): number[] {
  console.log('getNextRoundQuestions called with:', {
    currentQuestionId,
    wasAnswered,
    totalQuestions: questions.length
  });
  
  const unanswered = questions.filter(q => q.answeredRound === null);
  console.log('Unanswered questions:', unanswered.map(q => q.id));
  
  const filtered = unanswered.filter(q => wasAnswered ? q.id !== currentQuestionId : true);
  console.log('Filtered questions:', filtered.map(q => q.id));
  
  const result = filtered.map(q => q.id);
  console.log('Returning next round questions:', result);
  
  return result;
}
