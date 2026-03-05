import React, { ReactElement, useEffect, useState } from "react";
import { useGetCachedImportStatisticsQuery } from "../../graphql/generated";
import { useStore } from "../../store";
import { format } from "date-fns";

interface ImportStatsData {
  totalLocalFiles: number;
  alreadyImported: number;
  newFiles: number;
  percentageImported: string;
  pendingFiles: number;
  lastUpdated: string;
}

/**
 * Real-time import statistics widget
 * Displays live statistics from the file watcher and updates via Socket.IO
 */
export const RealTimeImportStats = (): ReactElement => {
  const [stats, setStats] = useState<ImportStatsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const getSocket = useStore((state) => state.getSocket);

  // Fetch initial cached statistics
  const {
    data: cachedStats,
    isLoading,
    error,
    refetch,
  } = useGetCachedImportStatisticsQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  );

  // Set initial stats from GraphQL query
  useEffect(() => {
    if (cachedStats?.getCachedImportStatistics?.success && cachedStats.getCachedImportStatistics.stats) {
      setStats({
        totalLocalFiles: cachedStats.getCachedImportStatistics.stats.totalLocalFiles,
        alreadyImported: cachedStats.getCachedImportStatistics.stats.alreadyImported,
        newFiles: cachedStats.getCachedImportStatistics.stats.newFiles,
        percentageImported: cachedStats.getCachedImportStatistics.stats.percentageImported,
        pendingFiles: cachedStats.getCachedImportStatistics.stats.pendingFiles,
        lastUpdated: cachedStats.getCachedImportStatistics.lastUpdated || new Date().toISOString(),
      });
    }
  }, [cachedStats]);

  // Setup Socket.IO listener for real-time updates
  useEffect(() => {
    const socket = getSocket("/");
    
    const handleConnect = () => {
      setIsConnected(true);
      console.log("Real-time import stats: Socket connected");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Real-time import stats: Socket disconnected");
    };

    const handleStatsUpdate = (data: any) => {
      console.log("Real-time import stats update received:", data);
      if (data.stats) {
        setStats({
          totalLocalFiles: data.stats.totalLocalFiles,
          alreadyImported: data.stats.alreadyImported,
          newFiles: data.stats.newFiles,
          percentageImported: data.stats.percentageImported,
          pendingFiles: data.stats.pendingFiles || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("IMPORT_STATISTICS_UPDATED", handleStatsUpdate);

    // Check initial connection state
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("IMPORT_STATISTICS_UPDATED", handleStatsUpdate);
    };
  }, [getSocket]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Loading statistics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/20 p-6">
        <div className="flex items-center">
          <span className="w-6 h-6 text-red-600">
            <i className="h-6 w-6 icon-[solar--danger-circle-bold]"></i>
          </span>
          <span className="ml-3 text-red-600 dark:text-red-400">
            Error loading statistics
          </span>
        </div>
      </div>
    );
  }

  // Handle cache not initialized or no stats available
  if (!stats || cachedStats?.getCachedImportStatistics?.success === false) {
    return (
      <div className="rounded-lg border border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-6 h-6 text-yellow-600">
              <i className="h-6 w-6 icon-[solar--info-circle-bold]"></i>
            </span>
            <div className="ml-3">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                Statistics Cache Initializing
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                {cachedStats?.getCachedImportStatistics?.message || "The file watcher is starting up. Statistics will appear shortly."}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-yellow-400 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            title="Retry"
          >
            <span className="w-4 h-4">
              <i className="h-4 w-4 icon-[solar--refresh-bold]"></i>
            </span>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const percentageValue = typeof stats.percentageImported === 'number' 
    ? stats.percentageImported 
    : parseFloat(stats.percentageImported);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 p-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="w-6 h-6 mr-2">
            <i className="h-6 w-6 icon-[solar--chart-bold-duotone]"></i>
          </span>
          Real-Time Folder Statistics
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              isConnected
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-600 animate-pulse" : "bg-gray-400"
              }`}
            ></span>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Statistics Grid */}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-4">
        <div className="flex flex-col rounded-lg bg-blue-100 dark:bg-blue-900/30 px-4 py-4 text-center">
          <dd className="text-2xl font-bold text-blue-600 dark:text-blue-400 md:text-3xl">
            {stats.totalLocalFiles}
          </dd>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Files
          </dt>
        </div>

        <div className="flex flex-col rounded-lg bg-green-100 dark:bg-green-900/30 px-4 py-4 text-center">
          <dd className="text-2xl font-bold text-green-600 dark:text-green-400 md:text-3xl">
            {stats.newFiles}
          </dd>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
            New Files
          </dt>
        </div>

        <div className="flex flex-col rounded-lg bg-yellow-100 dark:bg-yellow-900/30 px-4 py-4 text-center">
          <dd className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 md:text-3xl">
            {stats.alreadyImported}
          </dd>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Imported
          </dt>
        </div>

        <div className="flex flex-col rounded-lg bg-orange-100 dark:bg-orange-900/30 px-4 py-4 text-center">
          <dd className="text-2xl font-bold text-orange-600 dark:text-orange-400 md:text-3xl">
            {stats.pendingFiles}
          </dd>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Pending
          </dt>
        </div>

        <div className="flex flex-col rounded-lg bg-purple-100 dark:bg-purple-900/30 px-4 py-4 text-center">
          <dd className="text-2xl font-bold text-purple-600 dark:text-purple-400 md:text-3xl">
            {!isNaN(percentageValue) ? percentageValue.toFixed(1) : '0.0'}%
          </dd>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
            In Library
          </dt>
        </div>
      </dl>

      {/* Last Updated */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
        <span className="flex items-center">
          <span className="w-4 h-4 mr-1">
            <i className="h-4 w-4 icon-[solar--clock-circle-line-duotone]"></i>
          </span>
          Last updated: {format(new Date(stats.lastUpdated), "MMM d, yyyy 'at' h:mm:ss a")}
        </span>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Refresh statistics"
        >
          <span className="w-4 h-4">
            <i className="h-4 w-4 icon-[solar--refresh-bold]"></i>
          </span>
          Refresh
        </button>
      </div>

      {/* Info message about pending files */}
      {stats.pendingFiles > 0 && (
        <div className="mt-4 rounded-lg border-s-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-3">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            <span className="font-semibold">{stats.pendingFiles}</span> file{stats.pendingFiles !== 1 ? 's are' : ' is'} being stabilized before import (write in progress).
          </p>
        </div>
      )}

      {/* Info message about new files */}
      {stats.newFiles > 0 && stats.pendingFiles === 0 && (
        <div className="mt-4 rounded-lg border-s-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-3">
          <p className="text-sm text-green-700 dark:text-green-300">
            <span className="font-semibold">{stats.newFiles}</span> new file{stats.newFiles !== 1 ? 's are' : ' is'} ready to be imported.
          </p>
        </div>
      )}

      {/* All caught up message */}
      {stats.newFiles === 0 && stats.pendingFiles === 0 && stats.totalLocalFiles > 0 && (
        <div className="mt-4 rounded-lg border-s-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
            <span className="w-5 h-5 mr-2">
              <i className="h-5 w-5 icon-[solar--check-circle-bold]"></i>
            </span>
            All files in the folder are already imported!
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeImportStats;
