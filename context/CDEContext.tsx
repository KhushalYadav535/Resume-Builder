"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { INITIAL_QUESTION_QUEUE, CDE_QUESTIONS, QuestionDef } from '@/lib/cde/questionConfig';
import { evaluateNextQuestions, shouldSkipQuestion, KnownFacts } from '@/lib/cde/rulesEngine';

export interface ResumeContextInfo {
  hasResume: boolean;
  candidateName?: string;
  primaryRole?: string;
  primaryCompany?: string;
  companiesList?: string[];
  extractedTechSkills?: string[];
  estimatedYears?: number;
  fileName?: string;
}

interface CDEState {
  sessionId: string | null;
  knownFacts: KnownFacts;
  questionQueue: string[];
  currentQuestionId: string | null;
  currentQuestion: QuestionDef | null;
  profileStrength: number;
  isComplete: boolean;
  history: string[]; // Stack of previous question IDs
  isLoading: boolean;
  resumeContext: ResumeContextInfo | null;
  questionsMap: Record<string, QuestionDef>;
}

interface CDEContextProps extends CDEState {
  submitAnswer: (answer: any, extractedFacts?: any) => void;
  skipQuestion: () => void;
  goBack: () => void;
  updateFact: (key: string, value: any) => void;
  restartSession: () => void;
  stepIndex: number;
  totalSteps: number;
}

const CDEContext = createContext<CDEContextProps | undefined>(undefined);

export const CDEProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CDEState>({
    sessionId: null,
    knownFacts: {},
    questionQueue: INITIAL_QUESTION_QUEUE,
    currentQuestionId: INITIAL_QUESTION_QUEUE[0],
    currentQuestion: CDE_QUESTIONS[INITIAL_QUESTION_QUEUE[0]],
    profileStrength: 0,
    isComplete: false,
    history: [],
    isLoading: true,
    resumeContext: null,
    questionsMap: CDE_QUESTIONS,
  });

  const initSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch('/api/cde/session', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const { session, knownFacts = {}, dynamicQuestions = {}, questionQueue = INITIAL_QUESTION_QUEUE, resumeContext = null } = data;

        const mergedQuestions: Record<string, QuestionDef> = {
          ...CDE_QUESTIONS,
          ...dynamicQuestions,
        };

        const activeQueue: string[] = Array.isArray(questionQueue) && questionQueue.length > 0
          ? questionQueue
          : INITIAL_QUESTION_QUEUE;

        // Skip questions already answered in knownFacts
        const nextId = activeQueue.find((id) => knownFacts[id] === undefined) || null;

        setState({
          sessionId: session?.id || null,
          knownFacts,
          questionQueue: activeQueue,
          currentQuestionId: nextId,
          currentQuestion: nextId ? mergedQuestions[nextId] || null : null,
          profileStrength: Math.min(Object.keys(knownFacts).length * 15, 100),
          isComplete: !nextId,
          history: [],
          isLoading: false,
          resumeContext,
          questionsMap: mergedQuestions,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to init CDE session', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const moveToNextQuestion = (newQueue: string[], currentFacts: KnownFacts, newHistory: string[]) => {
    let nextIndex = newQueue.indexOf(state.currentQuestionId!) + 1;
    let nextId = newQueue[nextIndex];

    while (nextId && shouldSkipQuestion(nextId, currentFacts)) {
      nextIndex++;
      nextId = newQueue[nextIndex];
    }

    if (!nextId) {
      setState((prev) => ({ ...prev, isComplete: true, profileStrength: 100 }));
      return;
    }

    setState((prev) => ({
      ...prev,
      questionQueue: newQueue,
      currentQuestionId: nextId,
      currentQuestion: prev.questionsMap[nextId] || CDE_QUESTIONS[nextId] || null,
      history: newHistory,
    }));
  };

  const saveFactToDB = async (factKey: string, factValue: any) => {
    if (!state.sessionId) return;
    try {
      await fetch('/api/cde/save-fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          factKey,
          factValue,
          sourceQuestionId: state.currentQuestionId,
        }),
      });
    } catch (e) {
      console.error('Failed to save fact', e);
    }
  };

  const submitAnswer = async (answer: any, extractedFacts?: any) => {
    if (!state.currentQuestionId) return;

    // Save to DB in background
    saveFactToDB(state.currentQuestionId, answer);
    if (extractedFacts) {
      Object.keys(extractedFacts).forEach((key) => {
        saveFactToDB(key, extractedFacts[key]);
      });
    }

    const newFacts = {
      ...state.knownFacts,
      [state.currentQuestionId]: answer,
      ...(extractedFacts || {}),
    };
    const newStrength = Math.min(state.profileStrength + 15, 100);
    const newHistory = [...state.history, state.currentQuestionId];
    const newQueue = evaluateNextQuestions(state.currentQuestionId, answer, newFacts, state.questionQueue);

    setState((prev) => ({ ...prev, knownFacts: newFacts, profileStrength: newStrength }));
    moveToNextQuestion(newQueue, newFacts, newHistory);
  };

  const skipQuestion = () => {
    if (!state.currentQuestionId) return;
    const newHistory = [...state.history, state.currentQuestionId];
    moveToNextQuestion(state.questionQueue, state.knownFacts, newHistory);
  };

  const goBack = () => {
    if (state.history.length === 0) return;
    const newHistory = [...state.history];
    const prevId = newHistory.pop()!;

    setState((prev) => ({
      ...prev,
      currentQuestionId: prevId,
      currentQuestion: prev.questionsMap[prevId] || CDE_QUESTIONS[prevId] || null,
      history: newHistory,
      isComplete: false,
    }));
  };

  const updateFact = (key: string, value: any) => {
    setState((prev) => ({
      ...prev,
      knownFacts: { ...prev.knownFacts, [key]: value },
    }));
  };

  const restartSession = () => {
    setState((prev) => ({
      ...prev,
      knownFacts: {},
      currentQuestionId: prev.questionQueue[0] || null,
      currentQuestion: prev.questionsMap[prev.questionQueue[0]] || null,
      profileStrength: 0,
      isComplete: false,
      history: [],
    }));
  };

  const stepIndex = state.currentQuestionId
    ? state.questionQueue.indexOf(state.currentQuestionId) + 1
    : state.questionQueue.length;
  const totalSteps = state.questionQueue.length;

  return (
    <CDEContext.Provider
      value={{
        ...state,
        submitAnswer,
        skipQuestion,
        goBack,
        updateFact,
        restartSession,
        stepIndex,
        totalSteps,
      }}
    >
      {children}
    </CDEContext.Provider>
  );
};

export const useCDE = () => {
  const context = useContext(CDEContext);
  if (!context) {
    throw new Error('useCDE must be used within a CDEProvider');
  }
  return context;
};
