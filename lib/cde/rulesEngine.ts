import { CDE_QUESTIONS } from './questionConfig';

export interface KnownFacts {
  [key: string]: any;
}

/**
 * Evaluates the current known facts against the rule engine.
 * Returns an array of question IDs that should be dynamically inserted, 
 * or determines if we should skip the current question.
 */
export function evaluateNextQuestions(
  currentQuestionId: string,
  answerValue: any,
  knownFacts: KnownFacts,
  currentQueue: string[]
): string[] {
  let newQueue = [...currentQueue];

  // Logic Rule 1: If leadership = 'yes', we need to know the team size.
  // Insert q_team_size right after q_leadership
  if (currentQuestionId === 'q_leadership' && answerValue === 'yes') {
    if (!newQueue.includes('q_team_size')) {
      const currentIndex = newQueue.indexOf('q_leadership');
      if (currentIndex !== -1) {
        newQueue.splice(currentIndex + 1, 0, 'q_team_size');
      } else {
        newQueue.unshift('q_team_size'); // fallback
      }
    }
  }

  // Logic Rule 2: If leadership = 'no', ensure q_team_size is NOT in the queue
  if (currentQuestionId === 'q_leadership' && answerValue === 'no') {
    newQueue = newQueue.filter((id) => id !== 'q_team_size');
  }

  // Logic Rule 3: Skip Experience years if user is a student? (Example future rule)
  
  return newQueue;
}

export function shouldSkipQuestion(questionId: string, knownFacts: KnownFacts): boolean {
  // If we already know the answer to this question, skip it
  // In a robust implementation, you might map question IDs to fact keys
  // For now, if the questionId exists directly as a key in knownFacts, skip it.
  if (knownFacts[questionId] !== undefined) {
    return true;
  }
  return false;
}
