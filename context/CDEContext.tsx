"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { INITIAL_QUESTION_QUEUE, CDE_QUESTIONS, QuestionDef } from '@/lib/cde/questionConfig';
import { evaluateNextQuestions, shouldSkipQuestion, KnownFacts } from '@/lib/cde/rulesEngine';

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
}

interface CDEContextProps extends CDEState {
  submitAnswer: (answer: any, extractedFacts?: any) => void;
  skipQuestion: () => void;
  goBack: () => void;
  updateFact: (key: string, value: any) => void;
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
    isLoading: true, // start loading
  });

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('/api/cde/session', { method: 'POST' });
        if (res.ok) {
          const { session, knownFacts } = await res.json();
          setState(prev => {
            // Recalculate queue based on known facts
            let newQueue = INITIAL_QUESTION_QUEUE;
            // E.g. skip questions already answered
            const nextId = newQueue.find(id => !knownFacts[id]);
            
            return {
              ...prev,
              sessionId: session.id,
              knownFacts,
              profileStrength: Math.min(Object.keys(knownFacts).length * 15, 100),
              currentQuestionId: nextId || null,
              currentQuestion: nextId ? CDE_QUESTIONS[nextId] : null,
              isComplete: !nextId,
              isLoading: false
            };
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to init CDE session", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    initSession();
  }, []);

  const moveToNextQuestion = (newQueue: string[], currentFacts: KnownFacts, newHistory: string[]) => {
    let nextIndex = newQueue.indexOf(state.currentQuestionId!) + 1;
    let nextId = newQueue[nextIndex];

    while (nextId && shouldSkipQuestion(nextId, currentFacts)) {
      nextIndex++;
      nextId = newQueue[nextIndex];
    }

    if (!nextId) {
      setState(prev => ({ ...prev, isComplete: true, profileStrength: 100 }));
      return;
    }

    setState(prev => ({
      ...prev,
      questionQueue: newQueue,
      currentQuestionId: nextId,
      currentQuestion: CDE_QUESTIONS[nextId],
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
          sourceQuestionId: state.currentQuestionId
        })
      });
    } catch (e) {
      console.error("Failed to save fact", e);
    }
  };

  const submitAnswer = async (answer: any, extractedFacts?: any) => {
    if (!state.currentQuestionId) return;

    // Save to DB in background
    saveFactToDB(state.currentQuestionId, answer);
    if (extractedFacts) {
      // also save extracted facts
      Object.keys(extractedFacts).forEach(key => {
        saveFactToDB(key, extractedFacts[key]);
      });
    }

    const newFacts = { ...state.knownFacts, [state.currentQuestionId]: answer, ...(extractedFacts || {}) };
    const newStrength = Math.min(state.profileStrength + 15, 100);
    const newHistory = [...state.history, state.currentQuestionId];
    const newQueue = evaluateNextQuestions(state.currentQuestionId, answer, newFacts, state.questionQueue);

    setState(prev => ({ ...prev, knownFacts: newFacts, profileStrength: newStrength }));
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
    
    setState(prev => ({
      ...prev,
      currentQuestionId: prevId,
      currentQuestion: CDE_QUESTIONS[prevId],
      history: newHistory,
      isComplete: false,
    }));
  };

  const updateFact = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      knownFacts: { ...prev.knownFacts, [key]: value }
    }));
  };

  return (
    <CDEContext.Provider value={{ ...state, submitAnswer, skipQuestion, goBack, updateFact }}>
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
