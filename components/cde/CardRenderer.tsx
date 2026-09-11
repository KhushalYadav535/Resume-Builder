"use client";

import React from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { ChoiceCard } from './cards/ChoiceCard';
import { MultiSelectChipCard } from './cards/MultiSelectChipCard';
import { SliderCard } from './cards/SliderCard';
import { NumberCard } from './cards/NumberCard';
import { AIChatCard } from './cards/AIChatCard';
import { TimelineCard } from './cards/TimelineCard';
import { SearchCard } from './cards/SearchCard';
import { VoiceCard } from './cards/VoiceCard';

interface CardRendererProps {
  question: QuestionDef;
  onAnswer: (answer: any, extractedFacts?: any) => void;
  onSkip: () => void;
}

export const CardRenderer = ({ question, onAnswer, onSkip }: CardRendererProps) => {
  switch (question.type) {
    case 'choice':
      return <ChoiceCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'multi-select':
      return <MultiSelectChipCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'slider':
      return <SliderCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'number':
      return <NumberCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'ai-chat':
      return <AIChatCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'timeline':
      return <TimelineCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'search':
      return <SearchCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    case 'voice':
      return <VoiceCard question={question} onAnswer={onAnswer} onSkip={onSkip} />;
    default:
      return <div>Unsupported card type: {question.type}</div>;
  }
};
