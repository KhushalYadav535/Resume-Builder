"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceInputToggleProps {
  onTranscript: (text: string) => void;
}

export function VoiceInputToggle({ onTranscript }: VoiceInputToggleProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            onTranscript(finalTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
          setIsProcessing(false);
        };

        setRecognition(rec);
      }
    }
  }, [onTranscript]);

  const toggleRecording = useCallback(() => {
    if (!recognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => setIsProcessing(false), 500);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  }, [isRecording, recognition]);

  if (isProcessing) {
    return (
      <button className="p-2 rounded-full text-[var(--accent)] bg-[var(--accent-soft)] transition-colors">
        <Loader2 size={18} className="animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleRecording}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        isRecording 
          ? "bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent-glow)] animate-pulse" 
          : "text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
      }`}
      title={isRecording ? "Stop recording" : "Talk me through it"}
    >
      {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
    </button>
  );
}
