import React, { ReactElement, useEffect, useState } from "react";
import {
  useGetImportStatisticsQuery,
  useStartIncrementalImportMutation
} from "../../graphql/generated";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useImportSessionStatus } from "../../hooks/useImportSessionStatus";

/**
 * Import statistics with card-based layout and progress bar
 * Updates in real-time via the useImportSessionStatus hook
 */
export const RealTimeImportStats = (): ReactElement => {
  const [importError, setImportError] = useState<string | null>(null);
  const { getSocket, disconnectSocket, importJobQueue } = useStore(
    useShallow((state) => ({
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
      importJobQueue: state.importJobQueue,
    }))
  );

  // Get filesystem statistics (new files vs already imported)
  const { data: importStats, isLoading, refetch: refetchStats } = useGetImportStatisticsQuery(
    {},
    { refetchOnWindowFocus: false, refetchInterval: false }
  );

  // Get definitive import session status (handles Socket.IO events internally)
  const importSession = useImportSessionStatus();

  const { mutate: startIncrementalImport, isPending: isStartingImport } = useStartIncrementalImportMutation({
    onSuccess: (data) => {
      if (data.startIncrementalImport.success) {
        importJobQueue.setStatus("running");
        setImportError(null);
      }
    },
    onError: (error: any) => {
      console.error("Failed to start import:", error);
      setImportError(error?.message || "Failed to start import. Please try again.");
    },
  });

  const stats = importStats?.getImportStatistics?.stats;
  const hasNewFiles = stats && stats.newFiles > 0;

  // Refetch filesystem stats when import completes
  useEffect(() => {
    if (importSession.isComplete && importSession.status === "completed") {
      console.log("[RealTimeImportStats] Import completed, refetching filesystem stats");
      refetchStats();
      importJobQueue.setStatus("drained");
    }
  }, [importSession.isComplete, importSession.status, refetchStats, importJobQueue]);

  // Listen to filesystem change events to refetch stats
  useEffect(() => {
    const socket = getSocket("/");

    const handleFilesystemChange = () => {
      refetchStats();
    };

    // File system changes that affect import statistics
    socket.on("LS_FILE_ADDED", handleFilesystemChange);
    socket.on("LS_FILE_REMOVED", handleFilesystemChange);
    socket.on("LS_FILE_CHANGED", handleFilesystemChange);
    socket.on("LS_DIRECTORY_ADDED", handleFilesystemChange);
    socket.on("LS_DIRECTORY_REMOVED", handleFilesystemChange);
    socket.on("LS_LIBRARY_STATISTICS", handleFilesystemChange);

    return () => {
      socket.off("LS_FILE_ADDED", handleFilesystemChange);
      socket.off("LS_FILE_REMOVED", handleFilesystemChange);
      socket.off("LS_FILE_CHANGED", handleFilesystemChange);
      socket.off("LS_DIRECTORY_ADDED", handleFilesystemChange);
      socket.off("LS_DIRECTORY_REMOVED", handleFilesystemChange);
      socket.off("LS_LIBRARY_STATISTICS", handleFilesystemChange);
    };
  }, [getSocket, refetchStats]);

  const handleStartImport = async () => {
    setImportError(null);

    // Check if import is already active using definitive status
    if (importSession.isActive) {
      setImportError(
        `Cannot start import: An import session "${importSession.sessionId}" is already active. Please wait for it to complete.`
      );
      return;
    }

    if (importJobQueue.status === "drained") {
      localStorage.removeItem("sessionId");
      disconnectSocket("/");
      setTimeout(() => {
        getSocket("/");
        setTimeout(() => {
          const sessionId = localStorage.getItem("sessionId") || "";
          startIncrementalImport({ sessionId });
        }, 500);
      }, 100);
    } else {
      const sessionId = localStorage.getItem("sessionId") || "";
      startIncrementalImport({ sessionId });
    }
  };

  if (isLoading || !stats) {
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  // Determine button text based on whether there are already imported files
  const isFirstImport = stats.alreadyImported === 0;
  const buttonText = isFirstImport
    ? `Start Import (${stats.newFiles} files)`
    : `Start Incremental Import (${stats.newFiles} new files)`;

  // Calculate display statistics
  const displayStats = importSession.isActive && importSession.stats
    ? {
        totalFiles: importSession.stats.filesQueued + stats.alreadyImported,
        filesQueued: importSession.stats.filesQueued,
        filesSucceeded: importSession.stats.filesSucceeded,
      }
    : {
        totalFiles: stats.totalLocalFiles,
        filesQueued: stats.newFiles,
        filesSucceeded: stats.alreadyImported,
      };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {importError && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5">
              <i className="h-6 w-6 icon-[solar--danger-circle-bold]"></i>
            </span>
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300">Import Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{importError}</p>
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

      {/* Import Button - only show when there are new files and no active import */}
      {hasNewFiles && !importSession.isActive && (
        <button
          onClick={handleStartImport}
          disabled={isStartingImport}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-400 px-6 py-3 text-white font-medium transition-colors disabled:cursor-not-allowed"
        >
          <span className="w-6 h-6">
            <i className="h-6 w-6 icon-[solar--file-left-bold-duotone]"></i>
          </span>
          <span>{isStartingImport ? "Starting Import..." : buttonText}</span>
        </button>
      )}

      {/* Active Import Progress Bar */}
      {importSession.isActive && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Importing {importSession.stats?.filesSucceeded || 0} / {importSession.stats?.filesQueued || 0}...
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(importSession.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 relative"
              style={{ width: `${importSession.progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Files Detected Card */}
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#6b7280' }}>
          <div className="text-4xl font-bold text-white mb-2">
            {displayStats.totalFiles}
          </div>
          <div className="text-sm text-gray-200 font-medium">
            files detected
          </div>
        </div>

        {/* To Import Card */}
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#60a5fa' }}>
          <div className="text-4xl font-bold text-white mb-2">
            {displayStats.filesQueued}
          </div>
          <div className="text-sm text-gray-100 font-medium">
            to import
          </div>
        </div>

        {/* Already Imported Card */}
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#d8dab2' }}>
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {displayStats.filesSucceeded}
          </div>
          <div className="text-sm text-gray-700 font-medium">
            already imported
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeImportStats;
