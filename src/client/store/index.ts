import { create } from "zustand";
import io, { Socket } from "socket.io-client";
import { SOCKET_BASE_URI } from "../constants/endpoints";
import { isNil } from "lodash";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

// Type for global state
interface StoreState {
  socketInstances: Record<string, Socket>;
  getSocket: (namespace?: string) => Socket;
  disconnectSocket: (namespace: string) => void;
  queryClientRef: { current: any } | null;
  setQueryClientRef: (ref: any) => void;

  comicvine: {
    scrapingStatus: string;
  };

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

export const useStore = create<StoreState>((set, get) => ({
  socketInstances: {},
  queryClientRef: null,
  setQueryClientRef: (ref: any) => set({ queryClientRef: ref }),

  getSocket: (namespace = "/") => {
    const fullNamespace = namespace === "/" ? "" : namespace;
    const existing = get().socketInstances[namespace];

    if (existing && existing.connected) return existing;

    const sessionId = localStorage.getItem("sessionId");
    const socket = io(`${SOCKET_BASE_URI}${fullNamespace}`, {
      transports: ["websocket"],
      withCredentials: true,
      query: { sessionId },
    });

    socket.on("connect", () => {
      console.log(`✅ Connected to ${namespace}:`, socket.id);
    });

    if (sessionId) {
      socket.emit("call", "socket.resumeSession", { sessionId, namespace });
    } else {
      socket.on("sessionInitialized", (id) => {
        localStorage.setItem("sessionId", id);
      });
    }

    socket.on("RESTORE_JOB_COUNTS_AFTER_SESSION_RESTORATION", (data) => {
      const { completedJobCount, failedJobCount, queueStatus } = data;
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          successfulJobCount: completedJobCount,
          failedJobCount,
          status: queueStatus,
        },
      }));
    });

    socket.on("LS_COVER_EXTRACTED", ({ completedJobCount, importResult }) => {
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          successfulJobCount: completedJobCount,
          mostRecentImport: importResult.data.rawFileDetails.name,
        },
      }));
    });

    socket.on("LS_COVER_EXTRACTION_FAILED", ({ failedJobCount }) => {
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          failedJobCount,
        },
      }));
    });

    socket.on("LS_IMPORT_QUEUE_DRAINED", () => {
      localStorage.removeItem("sessionId");
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          status: "drained",
        },
      }));
      const queryClientRef = get().queryClientRef;
      if (queryClientRef?.current) {
        queryClientRef.current.invalidateQueries({ queryKey: ["allImportJobResults"] });
      }
    });

    socket.on("CV_SCRAPING_STATUS", (data) => {
      set((state) => ({
        comicvine: {
          ...state.comicvine,
          scrapingStatus: data.message,
        },
      }));
    });

    socket.on("searchResultsAvailable", (data) => {
      toast(`Results found for query: ${JSON.stringify(data.query, null, 2)}`);
    });

    set((state) => ({
      socketInstances: {
        ...state.socketInstances,
        [namespace]: socket,
      },
    }));

    return socket;
  },

  disconnectSocket: (namespace: string) => {
    const socket = get().socketInstances[namespace];
    if (socket) {
      socket.disconnect();
      set((state) => {
        const { [namespace]: _, ...rest } = state.socketInstances;
        return { socketInstances: rest };
      });
    }
  },

  comicvine: {
    scrapingStatus: "",
  },

  importJobQueue: {
    successfulJobCount: 0,
    failedJobCount: 0,
    status: undefined,
    mostRecentImport: null,

    setStatus: (status: string) =>
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          status,
        },
      })),

    setJobCount: (jobType: string, count: number) =>
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          ...(jobType === "successful"
            ? { successfulJobCount: count }
            : { failedJobCount: count }),
        },
      })),

    setMostRecentImport: (fileName: string) =>
      set((state) => ({
        importJobQueue: {
          ...state.importJobQueue,
          mostRecentImport: fileName,
        },
      })),
  },
}));
