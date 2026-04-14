import { ReactElement, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { isEmpty } from "lodash";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";
import { useGetJobResultStatisticsQuery } from "../../graphql/generated";
import { RealTimeImportStats } from "./RealTimeImportStats";
import { useImportSessionStatus } from "../../hooks/useImportSessionStatus";
import { SETTINGS_SERVICE_BASE_URI } from "../../constants/endpoints";

interface DirectoryIssue {
  directory: string;
  issue: string;
}

interface DirectoryStatus {
  isValid: boolean;
  issues: DirectoryIssue[];
}

export const Import = (): ReactElement => {
  const [importError, setImportError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { importJobQueue, getSocket, disconnectSocket } = useStore(
    useShallow((state) => ({
      importJobQueue: state.importJobQueue,
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
    })),
  );

  // Check if required directories exist
  const { data: directoryStatus, isLoading: isCheckingDirectories, isError: isDirectoryCheckError, error: directoryError } = useQuery({
    queryKey: ["directoryStatus"],
    queryFn: async (): Promise<DirectoryStatus> => {
      const response = await axios.get(`${SETTINGS_SERVICE_BASE_URI}/getDirectoryStatus`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache for 30 seconds
    retry: false, // Don't retry on failure - show error immediately
  });

  // Use isValid for quick check, issues array for detailed display
  // If there's an error fetching directory status, assume directories are invalid
  const directoryCheckFailed = isDirectoryCheckError;
  const hasAllDirectories = directoryCheckFailed ? false : (directoryStatus?.isValid ?? true);
  const directoryIssues = directoryStatus?.issues ?? [];

  // Force re-import mutation - re-imports all files regardless of import status
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
      setImportError(error?.response?.data?.message || error?.message || "Failed to start force re-import. Please try again.");
    },
  });

  const { data, isLoading, refetch } = useGetJobResultStatisticsQuery();

  const importSession = useImportSessionStatus();
  const hasActiveSession = importSession.isActive;
  const wasComplete = useRef(false);

  // React to importSession.isComplete rather than socket events — more reliable
  // since it's derived from the actual GraphQL state, not a raw socket event.
  useEffect(() => {
    if (importSession.isComplete && !wasComplete.current) {
      wasComplete.current = true;
      // Small delay so the backend has time to commit job result stats
      setTimeout(() => {
        // Invalidate the cache to force a fresh fetch of job result statistics
        queryClient.invalidateQueries({ queryKey: ["GetJobResultStatistics"] });
        refetch();
      }, 1500);
      importJobQueue.setStatus("drained");
    } else if (!importSession.isComplete) {
      wasComplete.current = false;
    }
  }, [importSession.isComplete, refetch, importJobQueue, queryClient]);

  // Listen to socket events to update Past Imports table in real-time
  useEffect(() => {
    const socket = getSocket("/");

    const handleImportCompleted = () => {
      console.log("[Import] IMPORT_SESSION_COMPLETED event - refreshing Past Imports");
      // Small delay to ensure backend has committed the job results
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["GetJobResultStatistics"] });
      }, 1500);
    };

    const handleQueueDrained = () => {
      console.log("[Import] LS_IMPORT_QUEUE_DRAINED event - refreshing Past Imports");
      // Small delay to ensure backend has committed the job results
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
   * Handles force re-import - re-imports all files to fix indexing issues
   */
  const handleForceReImport = async () => {
    setImportError(null);

    // Check for missing directories before starting
    if (!hasAllDirectories) {
      if (directoryCheckFailed) {
        setImportError(
          "Cannot start import: Failed to verify directory status. Please check that the backend service is running."
        );
      } else {
        const issueDetails = directoryIssues.map(i => `${i.directory}: ${i.issue}`).join(", ");
        setImportError(
          `Cannot start import: ${issueDetails || "Required directories are missing"}. Please check your Docker volume configuration.`
        );
      }
      return;
    }

    // Check for active session before starting using definitive status
    if (hasActiveSession) {
      setImportError(
        `Cannot start import: An import session "${importSession.sessionId}" is already active. Please wait for it to complete.`
      );
      return;
    }

    if (window.confirm(
      "This will re-import ALL files in your library folder, even those already imported. " +
      "This can help fix Elasticsearch indexing issues. Continue?"
    )) {
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
            <div className="my-6 max-w-screen-lg rounded-lg border-s-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5">
                  <i className="h-6 w-6 icon-[solar--danger-circle-bold]"></i>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    Import Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {importError}
                  </p>
                </div>
                <button
                  onClick={() => setImportError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <span className="w-5 h-5">
                    <i className="h-5 w-5 icon-[solar--close-circle-bold]"></i>
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Directory Check Error - shown when API call fails */}
          {!isCheckingDirectories && directoryCheckFailed && (
            <div className="my-6 max-w-screen-lg rounded-lg border-s-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5">
                  <i className="h-6 w-6 icon-[solar--danger-circle-bold]"></i>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    Failed to Check Directory Status
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Unable to verify if required directories exist. Import functionality has been disabled.
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                    Error: {(directoryError as Error)?.message || "Unknown error"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Directory Status Warning - shown when directories have issues */}
          {!isCheckingDirectories && !directoryCheckFailed && directoryIssues.length > 0 && (
            <div className="my-6 max-w-screen-lg rounded-lg border-s-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5">
                  <i className="h-6 w-6 icon-[solar--folder-error-bold]"></i>
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Directory Configuration Issues
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    The following issues were detected with your directory configuration:
                  </p>
                  <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 mt-2">
                    {directoryIssues.map((item) => (
                      <li key={item.directory}>
                        <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{item.directory}</code>
                        <span className="ml-1">— {item.issue}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                    Please ensure these directories are mounted correctly in your Docker configuration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Force Re-Import Button - always shown when no import is running */}
          {!hasActiveSession &&
           (importJobQueue.status === "drained" || importJobQueue.status === undefined) && (
            <div className="my-6 max-w-screen-lg">
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-orange-400 dark:border-orange-200 bg-orange-200 px-5 py-3 text-gray-700 hover:bg-transparent hover:text-orange-600 focus:outline-none focus:ring active:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleForceReImport}
                disabled={isForceReImporting || hasActiveSession || !hasAllDirectories}
                title={!hasAllDirectories
                  ? "Cannot import: Required directories are missing"
                  : "Re-import all files to fix Elasticsearch indexing issues"}
              >
                <span className="text-md font-medium">
                  {isForceReImporting ? "Starting Re-Import..." : "Force Re-Import All Files"}
                </span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--refresh-bold-duotone]"></i>
                </span>
              </button>
            </div>
          )}

          {/* Import activity is now shown in the RealTimeImportStats component above */}

          {!isLoading && !isEmpty(data?.getJobResultStatistics) && (
            <div className="max-w-screen-lg">
              <span className="flex items-center mt-6">
                <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
                  Past Imports
                </span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
              </span>

              <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-200 text-md">
                  <thead className="ltr:text-left rtl:text-right">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        #
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Time Started
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Session Id
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Imported
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                        Failed
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {data?.getJobResultStatistics.map((jobResult: any, index: number) => {
                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300 font-medium">
                            {index + 1}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                            {jobResult.earliestTimestamp && !isNaN(parseInt(jobResult.earliestTimestamp))
                              ? format(
                                  new Date(parseInt(jobResult.earliestTimestamp)),
                                  "EEEE, hh:mma, do LLLL y",
                                )
                              : "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                            <span className="tag is-warning">
                              {jobResult.sessionId}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300">
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              <span className="h-5 w-6">
                                <i className="icon-[solar--check-circle-line-duotone] h-5 w-5"></i>
                              </span>
                              <p className="whitespace-nowrap text-sm">
                                {jobResult.completedJobs}
                              </p>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-300">
                            <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                              <span className="h-5 w-6">
                                <i className="icon-[solar--close-circle-line-duotone] h-5 w-5"></i>
                              </span>

                              <p className="whitespace-nowrap text-sm">
                                {jobResult.failedJobs}
                              </p>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Import;
