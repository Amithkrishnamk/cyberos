"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";

export type TimerMode = "countdown" | "stopwatch";
export type TimerStatus = "idle" | "running" | "paused" | "stopped";

interface StartTimerOptions {
  mode: TimerMode;
  targetMinutes?: number;
  linkedNoteId?: string;
  category?: string;
}

interface ManualSessionOptions {
  durationMinutes: number;
  category: string;
  linkedNoteId?: string;
}

interface TimerContextType {
  mode: TimerMode;
  status: TimerStatus;
  targetMinutes: number;
  elapsedSeconds: number;
  linkedNoteId: string | null;
  category: string;
  activeSessionId: string | null;
  startedAt: string | null;
  showFeedbackModal: boolean;
  abandonedSession: any | null;
  startTimer: (options: StartTimerOptions) => Promise<void>;
  logManualSession: (options: ManualSessionOptions) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  completeSession: (feedback: { contentStudied: string; difficulties: string; nextSteps: string }) => Promise<void>;
  skipFeedback: () => Promise<void>;
  resetTimerState: () => void;
  closeAbandonedPrompt: () => void;
  terminateAndSignOut: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const [mode, setMode] = useState<TimerMode>("stopwatch");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [linkedNoteId, setLinkedNoteId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Web Security");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [abandonedSession, setAbandonedSession] = useState<any | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for active or abandoned sessions on initial load
  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeSession) {
          const s = data.activeSession;
          setActiveSessionId(s.id);
          setLinkedNoteId(s.linkedNoteId);
          setCategory(s.category || "General");
          setStartedAt(s.startedAt);

          const startMs = new Date(s.startedAt).getTime();
          const nowMs = Date.now();
          const elapsedSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
          setElapsedSeconds(elapsedSec);
          setStatus("running");
        }
      })
      .catch((err) => console.error("Error fetching active sessions:", err));
  }, [session]);

  // 1-second ticker effect
  useEffect(() => {
    if (status === "running") {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // 60-second heartbeat ping effect
  useEffect(() => {
    if (status === "running" && activeSessionId) {
      heartbeatIntervalRef.current = setInterval(() => {
        fetch(`/api/sessions/${activeSessionId}/heartbeat`, { method: "PATCH" }).catch((e) =>
          console.error("Heartbeat error:", e)
        );
      }, 60000);
    } else {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    }
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [status, activeSessionId]);

  const resetTimerState = useCallback(() => {
    setStatus("idle");
    setElapsedSeconds(0);
    setActiveSessionId(null);
    setStartedAt(null);
    setShowFeedbackModal(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
  }, []);

  const startTimer = async (options: StartTimerOptions) => {
    setMode(options.mode);
    setTargetMinutes(options.targetMinutes || 25);
    setLinkedNoteId(options.linkedNoteId || null);
    setCategory(options.category || "Web Security");
    setElapsedSeconds(0);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedNoteId: options.linkedNoteId,
          category: options.category,
        }),
      });

      const data = await res.json();
      if (data.studySession) {
        setActiveSessionId(data.studySession.id);
        setStartedAt(data.studySession.startedAt);
        setStatus("running");
      }
    } catch (err) {
      console.error("Failed to start timer session:", err);
    }
  };

  const logManualSession = async (options: ManualSessionOptions) => {
    setCategory(options.category || "Web Security");
    setLinkedNoteId(options.linkedNoteId || null);
    
    // Convert durationMinutes to seconds
    const minutesToLog = Math.max(1, options.durationMinutes);
    setElapsedSeconds(minutesToLog * 60);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedNoteId: options.linkedNoteId,
          category: options.category,
        }),
      });

      const data = await res.json();
      if (data.studySession) {
        setActiveSessionId(data.studySession.id);
        setStatus("stopped");
        setShowFeedbackModal(true);
      }
    } catch (err) {
      console.error("Failed to log manual session:", err);
    }
  };

  const pauseTimer = () => {
    setStatus("paused");
  };

  const resumeTimer = () => {
    setStatus("running");
  };

  const stopTimer = () => {
    setStatus("stopped");
    setShowFeedbackModal(true);
  };

  const completeSession = async (feedback: {
    contentStudied: string;
    difficulties: string;
    nextSteps: string;
  }) => {
    if (!activeSessionId) return;

    // Calculate accurate active study duration minutes from elapsedSeconds
    const activeDurationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      await fetch(`/api/sessions/${activeSessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endedAt: new Date().toISOString(),
          durationMinutes: activeDurationMinutes,
          contentStudied: feedback.contentStudied,
          difficulties: feedback.difficulties,
          nextSteps: feedback.nextSteps,
        }),
      });
    } catch (err) {
      console.error("Failed to complete session:", err);
      throw err;
    }
  };

  const skipFeedback = async () => {
    if (!activeSessionId) return;

    const activeDurationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      await fetch(`/api/sessions/${activeSessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endedAt: new Date().toISOString(),
          durationMinutes: activeDurationMinutes,
          contentStudied: "Quick study session completed.",
        }),
      });
    } catch (err) {
      console.error("Failed to skip feedback:", err);
    } finally {
      resetTimerState();
    }
  };

  const closeAbandonedPrompt = () => {
    setAbandonedSession(null);
  };

  const terminateAndSignOut = async () => {
    if (activeSessionId) {
      const activeDurationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      try {
        await fetch(`/api/sessions/${activeSessionId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endedAt: new Date().toISOString(),
            durationMinutes: activeDurationMinutes,
            contentStudied: "Study session auto-saved on user logout.",
          }),
        });
      } catch (err) {
        console.error("Error auto-closing active session on logout:", err);
      }
    }

    resetTimerState();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        status,
        targetMinutes,
        elapsedSeconds,
        linkedNoteId,
        category,
        activeSessionId,
        startedAt,
        showFeedbackModal,
        abandonedSession,
        startTimer,
        logManualSession,
        pauseTimer,
        resumeTimer,
        stopTimer,
        completeSession,
        skipFeedback,
        resetTimerState,
        closeAbandonedPrompt,
        terminateAndSignOut,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
