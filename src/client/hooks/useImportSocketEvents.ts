/**
 * @fileoverview Custom React hook for managing real-time import events via Socket.IO.
 * Provides reactive state tracking for import progress, file detection notifications,
 * and automatic query invalidation when import status changes.
 * @module hooks/useImportSocketEvents
 */

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../store";
import { useShallow } from "zustand/react/shallow";

/**
 * State object tracking real-time import progress via socket events.
 * @interface SocketImportState
 * @property {boolean} active - Whether import is currently in progress
 * @property {number} completed - Number of successfully completed import jobs
 * @property {number} total - Total number of jobs in the import queue
 * @property {number} failed - Number of failed import jobs
 */
export interface SocketImportState {
  /** Whether import is currently in progress */
  active: boolean;
  /** Number of successfully completed import jobs */
  completed: number;
  /** Total number of jobs in the import queue */
  total: number;
  /** Number of failed import jobs */
  failed: number;
}

/**
 * Return type for the useImportSocketEvents hook.
 * @interface UseImportSocketEventsReturn
 * @property {SocketImportState|null} socketImport - Real-time import progress state, null when no import active
 * @property {string|null} detectedFile - Name of recently detected file for toast notification
 * @property {Function} clearDetectedFile - Callback to clear the detected file notification
 */
export interface UseImportSocketEventsReturn {
  /** Real-time import progress state tracked via socket events */
  socketImport: SocketImportState | null;
  /** Name of recently detected file for toast notification */
  detectedFile: string | null;
  /** Clear the detected file notification */
  clearDetectedFile: () => void;
}

/**
 * Custom hook that manages socket event subscriptions for import-related events.
 * Automatically handles subscription lifecycle and query cache invalidation.
 *
 * Subscribes to the following Socket.IO events:
 * - `LS_LIBRARY_STATS` / `LS_FILES_MISSING`: Triggers statistics refresh
 * - `LS_FILE_DETECTED`: Shows toast notification for newly detected files
 * - `LS_INCREMENTAL_IMPORT_STARTED`: Initializes progress tracking
 * - `LS_COVER_EXTRACTED` / `LS_COVER_EXTRACTION_FAILED`: Updates progress counts
 * - `LS_IMPORT_QUEUE_DRAINED`: Marks import as complete
 *
 * @returns {UseImportSocketEventsReturn} Object containing import state and notification handlers
 * @example
 * const { socketImport, detectedFile, clearDetectedFile } = useImportSocketEvents();
 *
 * // Show progress bar when import is active
 * {socketImport?.active && (
 *   <ProgressBar value={socketImport.completed} max={socketImport.total} />
 * )}
 *
 * // Show toast when file detected
 * {detectedFile && (
 *   <Toast message={`Detected: ${detectedFile}`} onClose={clearDetectedFile} />
 * )}
 */
export function useImportSocketEvents(): UseImportSocketEventsReturn {
  const [socketImport, setSocketImport] = useState<SocketImportState | null>(null);
  const [detectedFile, setDetectedFile] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { getSocket } = useStore(
    useShallow((state) => ({
      getSocket: state.getSocket,
    })),
  );

  const clearDetectedFile = useCallback(() => {
    setDetectedFile(null);
  }, []);

  useEffect(() => {
    const socket = getSocket("/");

    const handleStatsChange = () => {
      queryClient.invalidateQueries({ queryKey: ["GetImportStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["GetWantedComics"] });
    };

    const handleFileDetected = (payload: { filePath: string }) => {
      handleStatsChange();
      const name = payload.filePath.split("/").pop() ?? payload.filePath;
      setDetectedFile(name);
      setTimeout(() => setDetectedFile(null), 5000);
    };

    const handleImportStarted = () => {
      setSocketImport({ active: true, completed: 0, total: 0, failed: 0 });
    };

    const handleCoverExtracted = (payload: {
      completedJobCount: number;
      totalJobCount: number;
      importResult: unknown;
    }) => {
      setSocketImport((prev) => ({
        active: true,
        completed: payload.completedJobCount,
        total: payload.totalJobCount,
        failed: prev?.failed ?? 0,
      }));
    };

    const handleCoverExtractionFailed = (payload: {
      failedJobCount: number;
      importResult: unknown;
    }) => {
      setSocketImport((prev) =>
        prev ? { ...prev, failed: payload.failedJobCount } : null,
      );
    };

    const handleQueueDrained = () => {
      setSocketImport((prev) => (prev ? { ...prev, active: false } : null));
      handleStatsChange();
    };

    socket.on("LS_LIBRARY_STATS", handleStatsChange);
    socket.on("LS_FILES_MISSING", handleStatsChange);
    socket.on("LS_FILE_DETECTED", handleFileDetected);
    socket.on("LS_INCREMENTAL_IMPORT_STARTED", handleImportStarted);
    socket.on("LS_COVER_EXTRACTED", handleCoverExtracted);
    socket.on("LS_COVER_EXTRACTION_FAILED", handleCoverExtractionFailed);
    socket.on("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);

    return () => {
      socket.off("LS_LIBRARY_STATS", handleStatsChange);
      socket.off("LS_FILES_MISSING", handleStatsChange);
      socket.off("LS_FILE_DETECTED", handleFileDetected);
      socket.off("LS_INCREMENTAL_IMPORT_STARTED", handleImportStarted);
      socket.off("LS_COVER_EXTRACTED", handleCoverExtracted);
      socket.off("LS_COVER_EXTRACTION_FAILED", handleCoverExtractionFailed);
      socket.off("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
    };
  }, [getSocket, queryClient]);

  return {
    socketImport,
    detectedFile,
    clearDetectedFile,
  };
}
