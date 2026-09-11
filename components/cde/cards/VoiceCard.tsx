"use client";

import React, { useState, useEffect, useRef } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../CDEContainer';

interface VoiceCardProps {
  question: QuestionDef;
  onAnswer: (value: string, extractedFacts?: any) => void;
  onSkip?: () => void;
}

export const VoiceCard = ({ question, onAnswer, onSkip }: VoiceCardProps) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setText(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        setText(''); // clear previous before starting new recording
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Your browser does not support Speech Recognition. Please type your answer.");
      }
    }
  };

  const handleContinue = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Pass to our existing AI Inference endpoint to extract facts
      const res = await fetch('/api/cde/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          promptHint: question.aiHint 
        })
      });

      if (!res.ok) throw new Error("Failed to extract facts");

      const data = await res.json();
      onAnswer(text, data.facts);
    } catch (error) {
      console.error("Inference error", error);
      onAnswer(text); // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-medium mb-4 text-neutral-900 dark:text-neutral-100">
        {question.question}
      </h2>
      
      {question.helpText && (
        <p className="text-neutral-500 mb-6">{question.helpText}</p>
      )}

      <div className="relative w-full h-48 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Click the microphone to start speaking, or type here..."
          className="w-full h-full p-4 pr-16 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-blue-500 transition-colors text-lg resize-none"
        />
        <button
          onClick={toggleRecording}
          className={cn(
            "absolute right-4 bottom-4 p-3 rounded-full transition-all shadow-md",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
              : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
          )}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-auto">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            disabled={isAnalyzing || isRecording}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={text.trim().length === 0 || isAnalyzing || isRecording}
          className="ml-auto flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};
