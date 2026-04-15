/**
 * @fileoverview Global Zustand store for application state management.
 * Manages socket connections, import job tracking, and ComicVine scraping state.
 * Uses Zustand for lightweight, hook-based state management with React.
 * @module store
 */

import { create } from "zustand";
import io, { Socket } from "socket.io-client";
import { SOCKET_BASE_URI } from "../constants/endpoints";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * React Query client instance for managing server state.
 * @constant {QueryClient}
 */
const queryClient = new QueryClient();

/**
 * Global application state interface.
 * Defines the shape of the Zustand store including socket management,
 * import job tracking, and external service state.
 * @interface StoreState
 */
interface StoreState {
  /** Active socket.io connections by namespace */
  socketInstances: Record<string, Socket>;
  /**
   * Get or create socket connection for namespace
   * @param namespace - Socket namespace (default: "/")
   * @returns Socket instance
   */
  getSocket: (namespace?: string) => Socket;
  /**
   * Disconnect and remove socket instance
   * @param namespace - Socket namespace to disconnect
   */
  disconnectSocket: (namespace: string) => void;
  /** ComicVine scraping state */
  comicvine: {
    scrapingStatus: string;
  };
  /** Import job queue state and actions */
  importJobQueue: {
    successfulJobCount: number;
    failedJobCount: number;
    status: string | undefined;
    mostRecentImport: string | null;
    setStatus: (status: string) => void;
    setJobCount: (jobType: string, count: number) => void;
    setMostRecentImport: (fileName: string) => void;
  };
}

/**
 * Zustand store for global app state and socket management
 */
export const useStore = create<StoreState>((set, get) => ({
  socketInstances: {},

  getSocket: (namespace = "/") => {
    const ns = namespace === "/" ? "" : namespace;
    const existing = get().socketInstances[namespace];
    // Return existing socket if it exists, regardless of connection state
    // This prevents creating duplicate sockets during connection phase
    if (existing) return existing;

    const sessionId = localStorage.getItem("sessionId");
    const socket = io(`${SOCKET_BASE_URI}${ns}`, {
      transports: ["websocket"],
      withCredentials: true,
      query: { sessionId },
    });

    socket.on("sessionInitialized", (id) => localStorage.setItem("sessionId", id));
    if (sessionId) socket.emit("call", "socket.resumeSession", { sessionId, namespace });

    socket.on("RESTORE_JOB_COUNTS_AFTER_SESSION_RESTORATION", ({ completedJobCount, failedJobCount, queueStatus }) =>
      set((s) => ({ importJobQueue: { ...s.importJobQueue, successfulJobCount: completedJobCount, failedJobCount, status: queueStatus } }))
    );

    socket.on("LS_COVER_EXTRACTED", ({ completedJobCount, importResult }) =>
      set((s) => ({ importJobQueue: { ...s.importJobQueue, successfulJobCount: completedJobCount, mostRecentImport: importResult.data.rawFileDetails.name } }))
    );

    socket.on("LS_COVER_EXTRACTION_FAILED", ({ failedJobCount }) =>
      set((s) => ({ importJobQueue: { ...s.importJobQueue, failedJobCount } }))
    );

    socket.on("LS_IMPORT_QUEUE_DRAINED", () => {
      set((s) => ({ importJobQueue: { ...s.importJobQueue, status: "drained" } }));
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["allImportJobResults"] });
        localStorage.removeItem("sessionId");
      }, 500);
    });

    socket.on("CV_SCRAPING_STATUS", ({ message }) =>
      set((s) => ({ comicvine: { ...s.comicvine, scrapingStatus: message } }))
    );

    socket.on("searchResultsAvailable", ({ query }) =>
      toast(`Results found for query: ${JSON.stringify(query, null, 2)}`)
    );

    set((s) => ({ socketInstances: { ...s.socketInstances, [namespace]: socket } }));
    return socket;
  },

  disconnectSocket: (namespace) => {
    const socket = get().socketInstances[namespace];
    if (socket) {
      socket.disconnect();
      set((s) => {
        const { [namespace]: _, ...rest } = s.socketInstances;
        return { socketInstances: rest };
      });
    }
  },

  comicvine: { scrapingStatus: "" },

  importJobQueue: {
    successfulJobCount: 0,
    failedJobCount: 0,
    status: undefined,
    mostRecentImport: null,
    setStatus: (status) => set((s) => ({ importJobQueue: { ...s.importJobQueue, status } })),
    setJobCount: (jobType, count) => set((s) => ({
      importJobQueue: { ...s.importJobQueue, [jobType === "successful" ? "successfulJobCount" : "failedJobCount"]: count }
    })),
    setMostRecentImport: (fileName) => set((s) => ({ importJobQueue: { ...s.importJobQueue, mostRecentImport: fileName } })),
  },
}));
