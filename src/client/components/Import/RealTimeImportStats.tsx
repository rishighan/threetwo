import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetImportStatisticsQuery,
  useGetWantedComicsQuery,
  useStartIncrementalImportMutation,
} from "../../graphql/generated";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useImportSessionStatus } from "../../hooks/useImportSessionStatus";

/**
 * Import statistics with card-based layout and progress bar.
 * Three states: pre-import (idle), importing (active), and post-import (complete).
 * Also surfaces missing files detected by the file watcher.
 */
export const RealTimeImportStats = (): ReactElement => {
  const [importError, setImportError] = useState<string | null>(null);
  const [detectedFile, setDetectedFile] = useState<string | null>(null);
  const [socketImport, setSocketImport] = useState<{
    active: boolean;
    completed: number;
    total: number;
    failed: number;
  } | null>(null);
  const queryClient = useQueryClient();

  const { getSocket, disconnectSocket, importJobQueue } = useStore(
    useShallow((state) => ({
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
      importJobQueue: state.importJobQueue,
    })),
  );

  const { data: importStats, isLoading } = useGetImportStatisticsQuery(
    {},
    { refetchOnWindowFocus: false, refetchInterval: false },
  );

  const stats = importStats?.getImportStatistics?.stats;

  // File list for the detail panel — only fetched when there are missing files
  const { data: missingComicsData } = useGetWantedComicsQuery(
    {
      paginationOptions: { limit: 3, page: 1 },
      predicate: { "importStatus.isRawFileMissing": true },
    },
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled: (stats?.missingFiles ?? 0) > 0,
    },
  );

  const missingDocs = missingComicsData?.getComicBooks?.docs ?? [];

  const getMissingComicLabel = (comic: any): string => {
    const series =
      comic.canonicalMetadata?.series?.value ??
      comic.inferredMetadata?.issue?.name;
    const issueNum =
      comic.canonicalMetadata?.issueNumber?.value ??
      comic.inferredMetadata?.issue?.number;
    if (series && issueNum) return `${series} #${issueNum}`;
    if (series) return series;
    return comic.rawFileDetails?.name ?? comic.id;
  };

  const importSession = useImportSessionStatus();

  const { mutate: startIncrementalImport, isPending: isStartingImport } =
    useStartIncrementalImportMutation({
      onSuccess: (data) => {
        if (data.startIncrementalImport.success) {
          importJobQueue.setStatus("running");
          setImportError(null);
        }
      },
      onError: (error: any) => {
        setImportError(
          error?.message || "Failed to start import. Please try again.",
        );
      },
    });

  const hasNewFiles = stats && stats.newFiles > 0;
  const missingCount = stats?.missingFiles ?? 0;

  // LS_LIBRARY_STATISTICS fires after every filesystem change and every import job completion.
  // Invalidating GetImportStatistics covers: total files, imported, new files, and missing count.
  // Invalidating GetWantedComics refreshes the missing file name list in the detail panel.
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

  const handleStartImport = async () => {
    setImportError(null);

    if (importSession.isActive) {
      setImportError(
        `Cannot start import: An import session "${importSession.sessionId}" is already active. Please wait for it to complete.`,
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

  const isFirstImport = stats.alreadyImported === 0;
  const buttonText = isFirstImport
    ? `Start Import (${stats.newFiles} files)`
    : `Start Incremental Import (${stats.newFiles} new files)`;

  // Determine what to show in each card based on current phase
  const sessionStats = importSession.stats;
  const hasSessionStats = importSession.isActive && sessionStats !== null;

  const totalFiles = stats.totalLocalFiles;
  const importedCount = stats.alreadyImported;
  const failedCount = hasSessionStats ? sessionStats!.filesFailed : 0;

  const showProgressBar = socketImport !== null;
  const socketProgressPct =
    socketImport && socketImport.total > 0
      ? Math.round((socketImport.completed / socketImport.total) * 100)
      : 0;
  const showFailedCard = hasSessionStats && failedCount > 0;
  const showMissingCard = missingCount > 0;

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
              <i className="h-5 w-5 icon-[solar--close-circle-bold]"></i>
            </button>
          </div>
        </div>
      )}

      {/* File detected toast */}
      {detectedFile && (
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-3 flex items-center gap-3">
          <i className="h-5 w-5 text-blue-600 dark:text-blue-400 icon-[solar--document-add-bold-duotone] shrink-0"></i>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-mono truncate">
            New file detected: {detectedFile}
          </p>
        </div>
      )}

      {/* Start Import button — only when idle with new files */}
      {hasNewFiles && !importSession.isActive && (
        <button
          onClick={handleStartImport}
          disabled={isStartingImport}
          className="flex items-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-400 px-6 py-3 text-white font-medium transition-colors disabled:cursor-not-allowed"
        >
          <i className="h-6 w-6 icon-[solar--file-left-bold-duotone]"></i>
          <span>{isStartingImport ? "Starting Import..." : buttonText}</span>
        </button>
      )}

      {/* Progress bar — shown while importing and once complete */}
      {showProgressBar && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {socketImport!.active
                ? `Importing ${socketImport!.completed} / ${socketImport!.total}`
                : `${socketImport!.completed} / ${socketImport!.total} imported`}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {socketProgressPct}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 relative"
              style={{ width: `${socketProgressPct}%` }}
            >
              {socketImport!.active && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total files */}
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: "#6b7280" }}
        >
          <div className="text-4xl font-bold text-white mb-2">{totalFiles}</div>
          <div className="text-sm text-gray-200 font-medium">in import folder</div>
        </div>

        {/* Imported */}
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: "#d8dab2" }}
        >
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {importedCount}
          </div>
          <div className="text-sm text-gray-700 font-medium">
            {importSession.isActive ? "imported so far" : "imported in database"}
          </div>
        </div>

        {/* Failed — only shown after a session with failures */}
        {showFailedCard && (
          <div className="rounded-lg p-6 text-center bg-red-500">
            <div className="text-4xl font-bold text-white mb-2">
              {failedCount}
            </div>
            <div className="text-sm text-red-100 font-medium">failed</div>
          </div>
        )}

        {/* Missing files — shown when watcher detects moved/deleted files */}
        {showMissingCard && (
          <div className="rounded-lg p-6 text-center bg-card-missing">
            <div className="text-4xl font-bold text-slate-700 mb-2">
              {missingCount}
            </div>
            <div className="text-sm text-slate-800 font-medium">missing</div>
          </div>
        )}
      </div>

      {/* Missing files detail panel */}
      {showMissingCard && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <i className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 icon-[solar--danger-triangle-bold] shrink-0"></i>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                {missingCount} {missingCount === 1 ? "file" : "files"} missing
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                These files were previously imported but can no longer be found
                on disk. Move them back to restore access.
              </p>
              {missingDocs.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {missingDocs.map((comic, i) => (
                    <li
                      key={i}
                      className="text-xs text-amber-700 dark:text-amber-400 truncate"
                    >
                      {getMissingComicLabel(comic)} is missing
                    </li>
                  ))}
                  {missingCount > 3 && (
                    <li className="text-xs text-amber-600 dark:text-amber-500">
                      and {missingCount - 3} more.
                    </li>
                  )}
                </ul>
              )}
              <Link
                to="/library?filter=missingFiles"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:text-amber-600"
              >
                
                <span className="underline">
                  <i className="icon-[solar--file-corrupted-outline] w-4 h-4 px-3" />
                  View Missing Files In Library
                  <i className="icon-[solar--arrow-right-up-outline] w-3 h-3" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeImportStats;
