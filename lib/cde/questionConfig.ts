export type QuestionType =
  | 'choice'
  | 'multi-select'
  | 'text'
  | 'ai-chat'
  | 'timeline'
  | 'number'
  | 'slider';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionDef {
  id: string;
  title?: string;
  question: string;
  type: QuestionType | 'search' | 'voice'; // extending type locally
  options?: QuestionOption[];
  helpText?: string;
  skipAllowed?: boolean;
  aiHint?: string; // Prompt for AI extraction if applicable
}

export const CDE_QUESTIONS: Record<string, QuestionDef> = {
  q_role_type: {
    id: 'q_role_type',
    question: 'Which best describes your role?',
    type: 'choice',
    options: [
      { label: 'Software Engineering', value: 'software_engineering' },
      { label: 'Sales & Marketing', value: 'sales_marketing' },
      { label: 'Design & UX', value: 'design_ux' },
      { label: 'Product Management', value: 'product_management' },
    ],
  },
  q_tech_stack: {
    id: 'q_tech_stack',
    question: 'What are your primary skills/technologies?',
    type: 'multi-select',
    helpText: 'Select up to 10',
  },
  q_experience_years: {
    id: 'q_experience_years',
    question: 'How many years of experience do you have?',
    type: 'slider',
    options: [
      { label: '0', value: '0' },
      { label: '20+', value: '20' },
    ],
  },
  q_leadership: {
    id: 'q_leadership',
    question: 'Did you manage a team?',
    type: 'choice',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
  },
  q_team_size: {
    id: 'q_team_size',
    question: 'How many people reported to you?',
    type: 'number',
  },
  q_biggest_achievement: {
    id: 'q_biggest_achievement',
    question: 'Describe your biggest achievement in your most recent role.',
    type: 'ai-chat',
    aiHint: 'Extract metrics, business impact, technologies, and leadership skills from this achievement.',
  },
  q_company: {
    id: 'q_company',
    question: 'Where did you work recently?',
    type: 'search',
    helpText: 'Search for your company name',
  },
  q_dates: {
    id: 'q_dates',
    question: 'When did you work there?',
    type: 'timeline',
  },
  q_voice_achievement: {
    id: 'q_voice_achievement',
    question: 'Tell us a story about a challenge you overcame.',
    type: 'voice',
    aiHint: 'Extract challenges, actions, and results (CAR format) from this story.',
  },
};

// Define the linear fallback flow
export const INITIAL_QUESTION_QUEUE = [
  'q_role_type',
  'q_experience_years',
  'q_tech_stack',
  'q_company',
  'q_dates',
  'q_leadership',
  'q_biggest_achievement',
  'q_voice_achievement'
];
