import { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetImportStatisticsQuery,
  useGetWantedComicsQuery,
  useStartIncrementalImportMutation,
} from "../../graphql/generated";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useImportSessionStatus } from "../../hooks/useImportSessionStatus";
import { useImportSocketEvents } from "../../hooks/useImportSocketEvents";
import { getComicDisplayLabel } from "../../shared/utils/formatting.utils";
import { AlertCard } from "../shared/AlertCard";
import { StatsCard } from "../shared/StatsCard";
import { ProgressBar } from "../shared/ProgressBar";

/**
 * RealTimeImportStats component displays import statistics with a card-based layout and progress bar.
 *
 * This component manages three distinct states:
 * - **Pre-import (idle)**: Shows current file counts and "Start Import" button when new files exist
 * - **Importing (active)**: Displays real-time progress bar with completed/total counts
 * - **Post-import (complete)**: Shows final statistics including failed imports
 *
 * Additionally, it surfaces missing files detected by the file watcher, allowing users
 * to see which previously-imported files are no longer found on disk.
 *
 * @returns {ReactElement} The rendered import statistics component
 */
export const RealTimeImportStats = (): ReactElement => {
  const [importError, setImportError] = useState<string | null>(null);

  const { socketImport, detectedFile } = useImportSocketEvents();
  const importSession = useImportSessionStatus();

  const { getSocket, disconnectSocket, importJobQueue } = useStore(
    useShallow((state) => ({
      getSocket: state.getSocket,
      disconnectSocket: state.disconnectSocket,
      importJobQueue: state.importJobQueue,
    })),
  );

  const { data: importStats, isLoading, isError: isStatsError, error: statsError } = useGetImportStatisticsQuery(
    {},
    { refetchOnWindowFocus: false, refetchInterval: false },
  );

  const stats = importStats?.getImportStatistics?.stats;
  const missingCount = stats?.missingFiles ?? 0;

  const { data: missingComicsData } = useGetWantedComicsQuery(
    {
      paginationOptions: { limit: 3, page: 1 },
      predicate: { "importStatus.isRawFileMissing": true },
    },
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled: missingCount > 0,
    },
  );

  const missingDocs = missingComicsData?.getComicBooks?.docs ?? [];

  const { mutate: startIncrementalImport, isPending: isStartingImport } =
    useStartIncrementalImportMutation({
      onSuccess: (data) => {
        if (data.startIncrementalImport.success) {
          importJobQueue.setStatus("running");
          setImportError(null);
        }
      },
      onError: (error: any) => {
        setImportError(error?.message || "Failed to start import. Please try again.");
      },
    });

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

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (isStatsError || !stats) {
    return (
      <AlertCard variant="error" title="Failed to Load Import Statistics">
        <p>Unable to retrieve import statistics from the server. Please check that the backend service is running.</p>
        {isStatsError && (
          <p className="mt-2">Error: {statsError instanceof Error ? statsError.message : "Unknown error"}</p>
        )}
      </AlertCard>
    );
  }

  const hasNewFiles = stats.newFiles > 0;
  const isFirstImport = stats.alreadyImported === 0;
  const buttonText = isFirstImport
    ? `Start Import (${stats.newFiles} files)`
    : `Start Incremental Import (${stats.newFiles} new files)`;

  const sessionStats = importSession.stats;
  const hasSessionStats = importSession.isActive && sessionStats !== null;
  const failedCount = hasSessionStats ? sessionStats!.filesFailed : 0;

  const showProgressBar = socketImport !== null;
  const showFailedCard = hasSessionStats && failedCount > 0;
  const showMissingCard = missingCount > 0;

  return (
    <div className="space-y-6">
      {importError && (
        <AlertCard variant="error" title="Import Error" onDismiss={() => setImportError(null)}>
          {importError}
        </AlertCard>
      )}

      {detectedFile && (
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-3 flex items-center gap-3">
          <i className="h-5 w-5 text-blue-600 dark:text-blue-400 icon-[solar--document-add-bold-duotone] shrink-0"></i>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-mono truncate">
            New file detected: {detectedFile}
          </p>
        </div>
      )}

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

      {showProgressBar && (
        <ProgressBar
          current={socketImport!.completed}
          total={socketImport!.total}
          isActive={socketImport!.active}
          activeLabel={`Importing ${socketImport!.completed} / ${socketImport!.total}`}
          completeLabel={`${socketImport!.completed} / ${socketImport!.total} imported`}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          value={stats.totalLocalFiles}
          label="in import folder"
          backgroundColor="#6b7280"
        />
        <StatsCard
          value={stats.alreadyImported}
          label={importSession.isActive ? "imported so far" : "imported in database"}
          backgroundColor="#d8dab2"
          valueColor="text-gray-800"
          labelColor="text-gray-700"
        />
        {showFailedCard && (
          <StatsCard
            value={failedCount}
            label="failed"
            backgroundColor="bg-red-500"
            labelColor="text-red-100"
          />
        )}
        {showMissingCard && (
          <StatsCard
            value={missingCount}
            label="missing"
            backgroundColor="bg-card-missing"
            valueColor="text-slate-700"
            labelColor="text-slate-800"
          />
        )}
      </div>

      {showMissingCard && (
        <AlertCard variant="warning" title={`${missingCount} ${missingCount === 1 ? "file" : "files"} missing`}>
          <p>These files were previously imported but can no longer be found on disk. Move them back to restore access.</p>
          {missingDocs.length > 0 && (
            <ul className="mt-2 space-y-1">
              {missingDocs.map((comic, i) => (
                <li key={i} className="text-xs truncate">
                  {getComicDisplayLabel(comic)} is missing
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
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium underline underline-offset-2 hover:opacity-70"
          >
            <i className="icon-[solar--file-corrupted-outline] w-4 h-4" />
            View Missing Files In Library
            <i className="icon-[solar--arrow-right-up-outline] w-3 h-3" />
          </Link>
        </AlertCard>
      )}
    </div>
  );
};

export default RealTimeImportStats;
