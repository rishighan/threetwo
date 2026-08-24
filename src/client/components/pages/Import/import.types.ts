/**
 * @fileoverview Type definitions for the Import module.
 * @module components/Import/import.types
 */

/**
 * Represents an issue with a configured directory.
 */
export type DirectoryIssue = {
  /** Path to the directory with issues */
  directory: string;
  /** Description of the issue */
  issue: string;
};

/**
 * Result of directory status check from the backend.
 */
export type DirectoryStatus = {
  /** Whether all required directories are accessible */
  isValid: boolean;
  /** List of specific issues found */
  issues: DirectoryIssue[];
};

/**
 * Statistics for a completed import job session.
 */
export type JobResultStatistics = {
  /** Unique session identifier */
  sessionId: string;
  /** Timestamp of the earliest job in the session (as string for GraphQL compatibility) */
  earliestTimestamp: string;
  /** Number of successfully completed jobs */
  completedJobs: number;
  /** Number of failed jobs */
  failedJobs: number;
};

/**
 * Status of the import job queue.
 */
export type ImportQueueStatus = "running" | "drained" | undefined;
