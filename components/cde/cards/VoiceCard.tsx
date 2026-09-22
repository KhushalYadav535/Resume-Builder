"use client";

import React, { useState, useEffect, useRef } from 'react';
import { QuestionDef } from '@/lib/cde/questionConfig';
import { Mic, MicOff, Loader2, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
          console.warn('Speech recognition warning:', event.error);
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
        setText('');
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert('Your browser does not support Speech Recognition. You can type your response below!');
      }
    }
  };

  const handleContinue = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/cde/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          promptHint: question.aiHint,
        }),
      });

      if (!res.ok) throw new Error('Failed to extract facts');

      const data = await res.json();
      onAnswer(text, data.facts);
    } catch (error) {
      console.warn('Inference note:', error);
      onAnswer(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center text-center justify-center">
      {/* Category Pill */}
      {question.title && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-black uppercase tracking-wider mb-3">
          <Sparkles size={12} />
          <span>{question.title}</span>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--text-primary)] max-w-lg font-['Syne',sans-serif] tracking-tight">
        {question.question}
      </h2>

      {question.helpText && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 max-w-md leading-relaxed">
          {question.helpText}
        </p>
      )}

      {/* Recording Status Bar */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg mb-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 text-xs font-bold"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Listening... speak naturally about your technical challenge</span>
        </motion.div>
      )}

      <div className="relative w-full max-w-lg">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Click the microphone to record your voice, or type your story here..."
          className="w-full p-4 pr-16 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none shadow-xs"
        />

        {/* Floating Mic Trigger Button */}
        <button
          type="button"
          onClick={toggleRecording}
          title={isRecording ? 'Stop Recording' : 'Start Voice Speech-to-Text'}
          className={`absolute right-3.5 bottom-3.5 p-3 rounded-full transition-all shadow-md cursor-pointer ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 scale-105'
              : 'bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-amber-500/25'
          }`}
        >
          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-6 w-full max-w-lg mx-auto">
        {question.skipAllowed !== false && onSkip && (
          <button
            onClick={onSkip}
            disabled={isAnalyzing || isRecording}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Skip for now &rarr;
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={text.trim().length === 0 || isAnalyzing || isRecording}
          className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Extracting Story Signals...</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
