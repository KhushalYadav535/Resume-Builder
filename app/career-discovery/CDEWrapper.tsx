"use client";

import React from 'react';
import { CDEContainer } from '@/components/cde/CDEContainer';
import { CardRenderer } from '@/components/cde/CardRenderer';
import { useCDE } from '@/context/CDEContext';

export const CDEWrapper = () => {
  const { currentQuestion, submitAnswer, skipQuestion, isComplete } = useCDE();

  return (
    <CDEContainer>
      {!isComplete && currentQuestion && (
        <CardRenderer
          question={currentQuestion}
          onAnswer={submitAnswer}
          onSkip={skipQuestion}
        />
      )}
    </CDEContainer>
  );
};
