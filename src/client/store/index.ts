import { create } from "zustand";
import { isNil } from "lodash";
import io from "socket.io-client";
import { SOCKET_BASE_URI } from "../constants/endpoints";
import { produce } from "immer";
import { QueryClient } from "@tanstack/react-query";


/*  Broadly, this file sets up:
 *    1. The zustand-based global client state
 *    2. socket.io client
 */
export const useStore = create((set, get) => ({
  // Socket.io state
  socketIOInstance: {},
  // ComicVine Scraping status
  comicvine: {
    scrapingStatus: "",
  },

  // Import job queue and associated statuses
  importJobQueue: {
    successfulJobCount: 0,
    failedJobCount: 0,
    status: undefined,
    setStatus: (status: string) =>
      set(
        produce((draftState) => {
          draftState.importJobQueue.status = status;
        }),
      ),
    setJobCount: (jobType: string, count: Number) => {
      switch (jobType) {
        case "successful":
          set(
            produce((draftState) => {
              draftState.importJobQueue.successfulJobCount = count;
            }),
          );
          break;

        case "failed":
          set(
            produce((draftState) => {
              draftState.importJobQueue.failedJobCount = count;
            }),
          );
          break;
      }
    },
    mostRecentImport: null,
    setMostRecentImport: (fileName: string) => {
      set(
        produce((state) => {
          state.importJobQueue.mostRecentImport = fileName;
        }),
      );
    },
  },
}));

const { getState, setState } = useStore;
const queryClient = new QueryClient();

/** Socket.IO initialization **/
// 1. Fetch sessionId from localStorage
const sessionId = localStorage.getItem("sessionId");
// 2. socket.io instantiation
const socketIOInstance = io(SOCKET_BASE_URI, {
  transports: ["websocket"],
  withCredentials: true,
  query: { sessionId },
});
// 3. Set the instance in global state
setState({
  socketIOInstance,
});

// Socket.io-based session restoration
if (!isNil(sessionId)) {
  // 1. Resume the session
  socketIOInstance.emit(
    "call",
    "socket.resumeSession",
    {
      sessionId,
    },
    (data) => console.log(data),
  );
} else {
  // 1. Inititalize the session and persist the sessionId to localStorage
  socketIOInstance.on("sessionInitialized", (sessionId) => {
    localStorage.setItem("sessionId", sessionId);
  });
}
// 2. If a job is in progress, restore the job counts and persist those to global state
socketIOInstance.on("RESTORE_JOB_COUNTS_AFTER_SESSION_RESTORATION", (data) => {
  console.log("Active import in progress detected; restoring counts...");
  const { completedJobCount, failedJobCount, queueStatus } = data;
  setState((state) => ({
    importJobQueue: {
      ...state.importJobQueue,
      successfulJobCount: completedJobCount,
      failedJobCount,
      status: queueStatus,
    },
  }));
});

// 1a.  Act on each comic issue successfully imported/failed, as indicated
//      by the LS_COVER_EXTRACTED/LS_COVER_EXTRACTION_FAILED events
socketIOInstance.on("LS_COVER_EXTRACTED", (data) => {
  const { completedJobCount, importResult } = data;
  console.log(importResult);
  setState((state) => ({
    importJobQueue: {
      ...state.importJobQueue,
      successfulJobCount: completedJobCount,
      mostRecentImport: importResult.data.rawFileDetails.name,
    },
  }));
});
socketIOInstance.on("LS_COVER_EXTRACTION_FAILED", (data) => {
  const { failedJobCount } = data;
  setState((state) => ({
    importJobQueue: {
      ...state.importJobQueue,
      failedJobCount,
    },
  }));
});

socketIOInstance.on("searchResultsAvailable", (data) => {
  console.log(data);
});

// 1b.  Clear the localStorage sessionId upon receiving the
//      LS_IMPORT_QUEUE_DRAINED event
socketIOInstance.on("LS_IMPORT_QUEUE_DRAINED", (data) => {
  localStorage.removeItem("sessionId");
  setState((state) => ({
    importJobQueue: {
      ...state.importJobQueue,
      status: "drained",
    },
  }));
  queryClient.invalidateQueries({ queryKey: ["allImportJobResults"] });
});

// ComicVine Scraping status
socketIOInstance.on("CV_SCRAPING_STATUS", (data) => {
  setState((state) => ({
    comicvine: {
      ...state.comicvine,
      scrapingStatus: data.message,
    },
  }));
});
