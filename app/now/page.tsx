"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { CareerContextModel } from "@/app/api/now/context/route";
import { NowResponsePayload } from "@/app/api/now/message/route";
import NowHome from "@/components/now/NowHome";
import NowWorkspace from "@/components/now/NowWorkspace";
import { useToast } from "@/components/ui/toast-1";

import { Suspense } from "react";

function NowPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [careerContext, setCareerContext] = useState<CareerContextModel | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [responsePayload, setResponsePayload] = useState<NowResponsePayload | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("Understanding what you're looking for…");

  // Fetch Career Context on mount
  useEffect(() => {
    let isMounted = true;

    async function loadContext() {
      try {
        const res = await fetch("/api/now/context");
        if (res.ok) {
          const data: CareerContextModel = await res.json();
          if (isMounted) setCareerContext(data);
        }
      } catch (err) {
        console.error("Failed to load career context:", err);
      } finally {
        if (isMounted) setLoadingContext(false);
      }
    }

    if (!authLoading) {
      loadContext();
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading]);

  // Handle Intent Submission
  const handleIntentSubmit = useCallback(
    async (intentText: string, intentHint?: string) => {
      setIsProcessing(true);
      setLoadingStepText("Understanding what you're looking for…");

      const t1 = setTimeout(() => {
        setLoadingStepText("Looking at your career context…");
      }, 500);

      const t2 = setTimeout(() => {
        setLoadingStepText("Assembling relevant modules from Pulse, Value & Navigator…");
      }, 1000);

      try {
        const res = await fetch("/api/now/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: intentText,
            intent_hint: intentHint,
            session_id: `now_${Date.now()}`,
          }),
        });

        clearTimeout(t1);
        clearTimeout(t2);

        if (!res.ok) {
          throw new Error("Failed to process career intent");
        }

        const data: NowResponsePayload = await res.json();
        setResponsePayload(data);
      } catch (err: any) {
        console.error("Now intent error:", err);
        showToast("I couldn't complete that right now. Your career information is safe.", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [showToast]
  );

  // Handle Thread Resumption (Spec Section 21)
  const handleResumeThread = useCallback(
    async (threadId: string) => {
      setIsProcessing(true);
      setLoadingStepText("Resuming your active career thread…");
      try {
        const res = await fetch(`/api/now/threads/${threadId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.thread?.response_snapshot?.response?.blocks) {
            setResponsePayload(data.thread.response_snapshot);
            return;
          }
        }
        // Fallback: If snapshot not present, submit intent from active thread
        const active = careerContext?.active_threads?.find((t) => t.id === threadId);
        if (active) {
          await handleIntentSubmit(active.title, active.intent);
        } else {
          showToast("Couldn't restore this thread.", "warning");
        }
      } catch (err) {
        console.error("Resume thread error:", err);
        showToast("Unable to resume thread.", "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [careerContext, handleIntentSubmit, showToast]
  );

  // Auto-trigger if intent or threadId query param is passed
  useEffect(() => {
    const urlThread = searchParams?.get("threadId");
    const urlIntent = searchParams?.get("intent");
    if (urlThread && !responsePayload && !isProcessing) {
      handleResumeThread(urlThread);
    } else if (urlIntent && !responsePayload && !isProcessing) {
      handleIntentSubmit(urlIntent, urlIntent);
    }
  }, [searchParams, responsePayload, isProcessing, handleIntentSubmit, handleResumeThread]);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] relative overflow-hidden flex flex-col">
      {/* Subtle Ambient Glow Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-6%",
          right: "-4%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-10%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(70px)",
          zIndex: 0,
        }}
      />

      <Navbar />

      <main className="flex-1 relative z-10">
        {responsePayload ? (
          <NowWorkspace
            responsePayload={responsePayload}
            onReset={() => setResponsePayload(null)}
            onRefineIntent={(msg) => handleIntentSubmit(msg)}
            isLoading={isProcessing}
            loadingStepText={loadingStepText}
          />
        ) : (
          <NowHome
            careerContext={careerContext}
            onSubmitIntent={handleIntentSubmit}
            onResumeThread={handleResumeThread}
            isLoading={isProcessing}
          />
        )}
      </main>
    </div>
  );
}

export default function NowPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center gap-3">
          <div className="spinner w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Connecting to Career Orchestrator...</span>
        </div>
      }
    >
      <NowPageContent />
    </Suspense>
  );
}
