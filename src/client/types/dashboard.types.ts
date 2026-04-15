/**
 * @fileoverview Centralized type definitions for Dashboard components.
 * @module types/dashboard.types
 */

import type { LocgMetadata } from "../graphql/generated";

/**
 * Props for ZeroState component.
 */
export type ZeroStateProps = {
  header: string;
  message: string;
};

/**
 * Props for PullList component.
 */
export type PullListProps = {
  issues?: LocgMetadata[];
};

/**
 * Library statistics structure for the dashboard.
 */
export type LibraryStats = {
  totalDocuments: number;
  comicDirectorySize: {
    totalSizeInGB?: number | null;
    fileCount?: number;
  };
  comicsMissingFiles: number;
  statistics?: Array<{
    issues?: unknown[] | null;
    issuesWithComicInfoXML?: unknown[] | null;
    fileLessComics?: unknown[] | null;
    fileTypes?: Array<{
      id: string;
      data: unknown[];
    }> | null;
    publisherWithMostComicsInLibrary?: Array<{
      id: string;
      count: number;
    }> | null;
  }> | null;
};

/**
 * Props for LibraryStatistics component.
 */
export type LibraryStatisticsProps = {
  stats: LibraryStats | null | undefined;
};

/**
 * Props for RecentlyImported component.
 */
export type RecentlyImportedProps = {
  comics?: unknown[];
  isLoading?: boolean;
};

/**
 * Props for VolumeGroups component.
 */
export type VolumeGroupsProps = {
  groups?: Array<{
    id: string;
    name: string;
    count: number;
  }>;
};

/**
 * Props for WantedComicsList component.
 */
export type WantedComicsListProps = {
  comics?: unknown[];
  isLoading?: boolean;
};
