import { useEffect, useState, useCallback, useRef } from "react";
import { useGetActiveImportSessionQuery } from "../graphql/generated";
import { useStore } from "../store";
import { useShallow } from "zustand/react/shallow";

export type ImportSessionStatus =
  | "idle"           // No import in progress
  | "running"        // Import actively processing
  | "completed"      // Import finished successfully
  | "failed"         // Import finished with errors
  | "unknown";       // Unable to determine status

export interface ImportSessionState {
  status: ImportSessionStatus;
  sessionId: string | null;
  progress: number; // 0-100
  stats: {
    filesQueued: number;
    filesProcessed: number;
    filesSucceeded: number;
    filesFailed: number;
  } | null;
  isComplete: boolean;
  isActive: boolean;
}

/**
 * Custom hook to definitively determine import session completion status
 *
 * Uses Socket.IO events to trigger GraphQL refetches:
 * - IMPORT_SESSION_STARTED: New import started
 * - IMPORT_SESSION_UPDATED: Progress update
 * - IMPORT_SESSION_COMPLETED: Import finished
 * - LS_IMPORT_QUEUE_DRAINED: All jobs processed
 *
 * A session is considered DEFINITIVELY COMPLETE when:
 * - session.status === "completed" OR session.status === "failed"
 * - OR LS_IMPORT_QUEUE_DRAINED event is received AND no active session exists
 * - OR IMPORT_SESSION_COMPLETED event is received
 *
 * NO POLLING - relies entirely on Socket.IO events for real-time updates
 */
export const useImportSessionStatus = (): ImportSessionState => {
  
  const [sessionState, setSessionState] = useState<ImportSessionState>({
    status: "unknown",
    sessionId: null,
    progress: 0,
    stats: null,
    isComplete: false,
    isActive: false,
  });

  const { getSocket } = useStore(
    useShallow((state) => ({
      getSocket: state.getSocket,
    }))
  );

  // Track if we've received completion events
  const completionEventReceived = useRef(false);
  const queueDrainedEventReceived = useRef(false);
  // Only true if IMPORT_SESSION_STARTED fired in this browser session.
  // Prevents a stale "running" DB session from showing as active on hard refresh.
  const sessionStartedEventReceived = useRef(false);

  // Query active import session - polls every 3s as a fallback when a session is
  // active (e.g. tab re-opened mid-import and socket events were missed)
  const { data: sessionData, refetch } = useGetActiveImportSessionQuery(
    {},
    {
      refetchOnWindowFocus: true,
      refetchInterval: (query) => {
        const s = (query.state.data as any)?.getActiveImportSession;
        return s?.status === "running" || s?.status === "active" || s?.status === "processing"
          ? 3000
          : false;
      },
    }
  );

  const session = sessionData?.getActiveImportSession;

  /**
   * Determine definitive completion status
   */
  const determineStatus = useCallback((): ImportSessionState => {
    // Case 1: No session exists
    if (!session) {
      // If we received completion events, mark as completed
      if (completionEventReceived.current || queueDrainedEventReceived.current) {
        return {
          status: "completed",
          sessionId: null,
          progress: 100,
          stats: null,
          isComplete: true,
          isActive: false,
        };
      }
      
      // Otherwise, system is idle
      return {
        status: "idle",
        sessionId: null,
        progress: 0,
        stats: null,
        isComplete: false,
        isActive: false,
      };
    }

    // Case 2: Session exists - check its status field
    const { status, sessionId, stats } = session;
    
    // Calculate progress
    const progress = stats.filesQueued > 0
      ? Math.min(100, Math.round((stats.filesSucceeded / stats.filesQueued) * 100))
      : 0;

    // Detect stuck sessions: status="running" but all files processed
    const isStuckOrComplete =
      status === "running" &&
      stats.filesQueued > 0 &&
      stats.filesProcessed >= stats.filesQueued;

    // DEFINITIVE COMPLETION: Check status field or stuck session
    if (status === "completed" || isStuckOrComplete) {
      completionEventReceived.current = true;
      return {
        status: "completed",
        sessionId,
        progress: 100,
        stats: {
          filesQueued: stats.filesQueued,
          filesProcessed: stats.filesProcessed,
          filesSucceeded: stats.filesSucceeded,
          filesFailed: stats.filesFailed,
        },
        isComplete: true,
        isActive: false,
      };
    }

    if (status === "failed") {
      completionEventReceived.current = true;
      return {
        status: "failed",
        sessionId,
        progress,
        stats: {
          filesQueued: stats.filesQueued,
          filesProcessed: stats.filesProcessed,
          filesSucceeded: stats.filesSucceeded,
          filesFailed: stats.filesFailed,
        },
        isComplete: true,
        isActive: false,
      };
    }

    // Case 3: Check if session is actually running/active
    if (status === "running" || status === "active" || status === "processing") {
      const hasQueuedWork = stats.filesQueued > 0 && stats.filesProcessed < stats.filesQueued;
      // Only treat as "just started" if the started event fired in this browser session.
      // Prevents a stale DB session from showing a 0% progress bar on hard refresh.
      const justStarted = stats.filesQueued === 0 && stats.filesProcessed === 0 && sessionStartedEventReceived.current;

      // No in-session event AND no actual progress → stale unclosed session from a previous run.
      // Covers the case where the backend stores filesQueued but never updates filesProcessed/filesSucceeded.
      const likelyStale = !sessionStartedEventReceived.current
        && stats.filesProcessed === 0
        && stats.filesSucceeded === 0;

      if ((hasQueuedWork || justStarted) && !likelyStale) {
        return {
          status: "running",
          sessionId,
          progress,
          stats: {
            filesQueued: stats.filesQueued,
            filesProcessed: stats.filesProcessed,
            filesSucceeded: stats.filesSucceeded,
            filesFailed: stats.filesFailed,
          },
          isComplete: false,
          isActive: true,
        };
      } else {
        // Session says "running" but all files processed — likely a stale session
        console.warn(`[useImportSessionStatus] Session "${sessionId}" appears stale (status: "${status}", processed: ${stats.filesProcessed}, queued: ${stats.filesQueued}) - treating as idle`);
        return {
          status: "idle",
          sessionId: null,
          progress: 0,
          stats: null,
          isComplete: false,
          isActive: false,
        };
      }
    }

    // Case 4: Session exists but has unknown/other status - treat as idle
    console.warn(`[useImportSessionStatus] Unknown session status: "${status}"`);
    return {
      status: "idle",
      sessionId: null,
      progress: 0,
      stats: null,
      isComplete: false,
      isActive: false,
    };
  }, [session]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    console.log("[useImportSessionStatus] Initial mount - fetching session");
    refetch();
  }, [refetch]);

  /**
   * Update state whenever session data changes
   */
  useEffect(() => {
    const newState = determineStatus();
    setSessionState(newState);
    
    // Log status changes for debugging
    console.log("[useImportSessionStatus] Status determined:", {
      status: newState.status,
      sessionId: newState.sessionId,
      progress: newState.progress,
      isComplete: newState.isComplete,
      isActive: newState.isActive,
      stats: newState.stats,
      rawSession: session,
    });
  }, [determineStatus, session]);

  /**
   * Listen to Socket.IO events for real-time completion detection
   */
  useEffect(() => {
    const socket = getSocket("/");

    const handleSessionCompleted = () => {
      console.log("[useImportSessionStatus] IMPORT_SESSION_COMPLETED event received");
      completionEventReceived.current = true;
      refetch(); // Immediately refetch to get final status
    };

    const handleQueueDrained = () => {
      console.log("[useImportSessionStatus] LS_IMPORT_QUEUE_DRAINED event received");
      queueDrainedEventReceived.current = true;
      refetch(); // Immediately refetch to confirm no active session
    };

    const handleSessionStarted = () => {
      console.log("[useImportSessionStatus] IMPORT_SESSION_STARTED / LS_INCREMENTAL_IMPORT_STARTED event received");
      // Reset completion flags when new session starts
      completionEventReceived.current = false;
      queueDrainedEventReceived.current = false;
      sessionStartedEventReceived.current = true;
      refetch();
    };

    const handleSessionUpdated = () => {
      console.log("[useImportSessionStatus] IMPORT_SESSION_UPDATED event received");
      refetch();
    };

    // Listen to completion events
    socket.on("IMPORT_SESSION_COMPLETED", handleSessionCompleted);
    socket.on("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
    socket.on("IMPORT_SESSION_STARTED", handleSessionStarted);
    socket.on("LS_INCREMENTAL_IMPORT_STARTED", handleSessionStarted);
    socket.on("IMPORT_SESSION_UPDATED", handleSessionUpdated);

    return () => {
      socket.off("IMPORT_SESSION_COMPLETED", handleSessionCompleted);
      socket.off("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
      socket.off("IMPORT_SESSION_STARTED", handleSessionStarted);
      socket.off("LS_INCREMENTAL_IMPORT_STARTED", handleSessionStarted);
      socket.off("IMPORT_SESSION_UPDATED", handleSessionUpdated);
    };
  }, [getSocket, refetch]);

  return sessionState;
};
