/**
 * @fileoverview Import page component for managing comic library imports.
 * Provides UI for starting imports, monitoring progress, viewing history,
 * and handling directory configuration issues.
 * @module components/Import/Import
 */

import { ReactElement, useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";
import { useGetJobResultStatisticsQuery } from "../../graphql/generated";
import { RealTimeImportStats } from "./RealTimeImportStats";
import { PastImportsTable } from "./PastImportsTable";
import { AlertBanner } from "../shared/AlertBanner";
import { useImportSessionStatus } from "../../hooks/useImportSessionStatus";
import { SETTINGS_SERVICE_BASE_URI } from "../../constants/endpoints";
import type { DirectoryStatus, DirectoryIssue } from "./import.types";

/**
 * Import page component for managing comic library imports.
 *
 * Features:
 * - Real-time import progress tracking via WebSocket
 * - Directory status validation before import
 * - Force re-import functionality for fixing indexing issues
 * - Past import history table
 * - Session management for import tracking
 *
 * @returns {ReactElement} The import page UI
 */
export const Import = (): ReactElement => {
  const [importError, setImportError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { importJobQueue, getSocket, disconnectSocket } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
    }))
  );

  // Check if required directories exist
  const {
    data: directoryStatus,
    isLoading: isCheckingDirectories,
    isError: isDirectoryCheckError,
    error: directoryError,
  } = useQuery({
    queryKey: ["directoryStatus"],
    queryFn: async (): Promise<DirectoryStatus> => {
      const response = await axios.get(
        `${SETTINGS_SERVICE_BASE_URI}/getDirectoryStatus`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
    retry: false,
  });

  // Use isValid for quick check, issues array for detailed display
  const directoryCheckFailed = isDirectoryCheckError;
  const hasAllDirectories = directoryCheckFailed
    ? false
    : (directoryStatus?.isValid ?? true);
  const directoryIssues = directoryStatus?.issues ?? [];

  // Force re-import mutation
  const { mutate: forceReImport, isPending: isForceReImporting } = useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem("sessionId") || "";
      return await axios.request({
        url: `http://localhost:3000/api/library/forceReImport`,
        method: "POST",
        data: { sessionId },
      });
    },
    onSuccess: (response) => {
      console.log("Force re-import initiated:", response.data);
      importJobQueue.setStatus("running");
      setImportError(null);
    },
    onError: (error: any) => {
      console.error("Failed to start force re-import:", error);
      setImportError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to start force re-import. Please try again."
      );
    },
  });

  const { data, isLoading, refetch } = useGetJobResultStatisticsQuery();

  const importSession = useImportSessionStatus();
  const hasActiveSession = importSession.isActive;
  const wasComplete = useRef(false);

  // React to importSession.isComplete for state updates
  useEffect(() => {
    if (importSession.isComplete && !wasComplete.current) {
      wasComplete.current = true;
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["GetJobResultStatistics"] });
        refetch();
      }, 1500);
      importJobQueue.setStatus("drained");
    } else if (!importSession.isComplete) {
      wasComplete.current = false;
    }
  }, [importSession.isComplete, refetch, importJobQueue, queryClient]);

  // Listen to socket events to update Past Imports table
  useEffect(() => {
    const socket = getSocket("/");

    const handleImportCompleted = () => {
      console.log(
        "[Import] IMPORT_SESSION_COMPLETED event - refreshing Past Imports"
      );
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["GetJobResultStatistics"] });
      }, 1500);
    };

    const handleQueueDrained = () => {
      console.log(
        "[Import] LS_IMPORT_QUEUE_DRAINED event - refreshing Past Imports"
      );
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["GetJobResultStatistics"] });
      }, 1500);
    };

    socket.on("IMPORT_SESSION_COMPLETED", handleImportCompleted);
    socket.on("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);

    return () => {
      socket.off("IMPORT_SESSION_COMPLETED", handleImportCompleted);
      socket.off("LS_IMPORT_QUEUE_DRAINED", handleQueueDrained);
    };
  }, [getSocket, queryClient]);

  /**
   * Initiates a force re-import of all library files.
   *
   * When the queue is already drained, disconnects and reconnects the socket
   * before triggering the import — ensures the backend receives a fresh session
   * rather than reusing a stale one that would be ignored.
   *
   * Validates directory availability and active session state before proceeding
   * to prevent duplicate or broken imports.
   */
  const handleForceReImport = async () => {
    setImportError(null);

    if (!hasAllDirectories) {
      if (directoryCheckFailed) {
        setImportError(
          "Cannot start import: Failed to verify directory status. Please check that the backend service is running."
        );
      } else {
        const issueDetails = directoryIssues
          .map((i) => `${i.directory}: ${i.issue}`)
          .join(", ");
        setImportError(
          `Cannot start import: ${issueDetails || "Required directories are missing"}. Please check your Docker volume configuration.`
        );
      }
      return;
    }

    if (hasActiveSession) {
      setImportError(
        `Cannot start import: An import session "${importSession.sessionId}" is already active. Please wait for it to complete.`
      );
      return;
    }

    if (
      window.confirm(
        "This will re-import ALL files in your library folder, even those already imported. " +
          "This can help fix Elasticsearch indexing issues. Continue?"
      )
    ) {
      if (importJobQueue.status === "drained") {
        localStorage.removeItem("sessionId");
        disconnectSocket("/");
        setTimeout(() => {
          getSocket("/");
          setTimeout(() => {
            forceReImport();
          }, 500);
        }, 100);
      } else {
        forceReImport();
      }
    }
  };

  // `undefined` covers the initial state before any import has ever run in this session
  const canStartImport =
    !hasActiveSession &&
    (importJobQueue.status === "drained" || importJobQueue.status === undefined);

  return (
    <div>
      <section>
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Import
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Import comics into the ThreeTwo library.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <article
            role="alert"
            className="rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
          >
            <div>
              <p>
                Importing will add comics identified from the mapped folder into
                ThreeTwo's database.
              </p>
              <p>
                Metadata from ComicInfo.xml, if present, will also be extracted.
              </p>
              <p>
                This process could take a while, if you have a lot of comics, or
                are importing over a network connection.
              </p>
            </div>
          </article>

          {/* Import Statistics */}
          <div className="my-6 max-w-screen-lg">
            <RealTimeImportStats />
          </div>

          {/* Error Message */}
          {importError && (
            <div className="my-6 max-w-screen-lg">
              <AlertBanner
                severity="error"
                title="Import Error"
                onClose={() => setImportError(null)}
              >
                {importError}
              </AlertBanner>
            </div>
          )}

          {/* Directory Check Error */}
          {!isCheckingDirectories && directoryCheckFailed && (
            <div className="my-6 max-w-screen-lg">
              <AlertBanner severity="error" title="Failed to Check Directory Status">
                <p>
                  Unable to verify if required directories exist. Import
                  functionality has been disabled.
                </p>
                <p className="mt-2">
                  Error: {(directoryError as Error)?.message || "Unknown error"}
                </p>
              </AlertBanner>
            </div>
          )}

          {/* Directory Status Warning */}
          {!isCheckingDirectories &&
            !directoryCheckFailed &&
            directoryIssues.length > 0 && (
              <div className="my-6 max-w-screen-lg">
                <AlertBanner
                  severity="warning"
                  title="Directory Configuration Issues"
                  iconClass="icon-[solar--folder-error-bold]"
                >
                  <p>
                    The following issues were detected with your directory
                    configuration:
                  </p>
                  <DirectoryIssuesList issues={directoryIssues} />
                  <p className="mt-2">
                    Please ensure these directories are mounted correctly in your
                    Docker configuration.
                  </p>
                </AlertBanner>
              </div>
            )}

          {/* Force Re-Import Button */}
          {canStartImport && (
            <div className="my-6 max-w-screen-lg">
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-orange-400 dark:border-orange-200 bg-orange-200 px-5 py-3 text-gray-700 hover:bg-transparent hover:text-orange-600 focus:outline-none focus:ring active:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleForceReImport}
                disabled={isForceReImporting || hasActiveSession || !hasAllDirectories}
                title={
                  !hasAllDirectories
                    ? "Cannot import: Required directories are missing"
                    : "Re-import all files to fix Elasticsearch indexing issues"
                }
              >
                <span className="text-md font-medium">
                  {isForceReImporting
                    ? "Starting Re-Import..."
                    : "Force Re-Import All Files"}
                </span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--refresh-bold-duotone]"></i>
                </span>
              </button>
            </div>
          )}

          {/* Past Imports Table */}
          {!isLoading && !isEmpty(data?.getJobResultStatistics) && (
            <PastImportsTable data={data!.getJobResultStatistics as any} />
          )}
        </div>
      </section>
    </div>
  );
};

/**
 * Helper component to render directory issues list.
 */
const DirectoryIssuesList = ({ issues }: { issues: DirectoryIssue[] }): ReactElement => (
  <ul className="list-disc list-inside mt-2">
    {issues.map((item) => (
      <li key={item.directory}>
        <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
          {item.directory}
        </code>
        <span className="ml-1">— {item.issue}</span>
      </li>
    ))}
  </ul>
);

export default Import;
