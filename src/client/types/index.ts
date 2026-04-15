/**
 * @fileoverview Barrel export for all centralized type definitions.
 * Import types from here for cleaner imports throughout the application.
 * @module types
 *
 * @example
 * ```ts
 * import type { ComicDetailProps, AlertVariant, LibrarySearchQuery } from '../types';
 * ```
 */

// Comic Detail types
export type {
  ComicVineMetadata,
  Acquisition,
  ComicDetailProps,
  TabConfig,
  TabConfigParams,
  ComicVineMatchPanelProps,
  MatchResultProps,
  AcquisitionPanelProps,
  ComicVineDetailsProps,
  CVMatchesPanelProps,
  EditMetadataPanelProps,
  DownloadProgressTickProps,
  DownloadTickData,
  AsyncSelectPaginateProps,
  SourcedMetadata,
  VolumeInformationData,
  VolumeInformationProps,
  ScalarCellProps,
} from "./comic.types";

// Dashboard types
export type {
  ZeroStateProps,
  PullListProps,
  LibraryStats,
  LibraryStatisticsProps,
  RecentlyImportedProps,
  VolumeGroupsProps,
  WantedComicsListProps,
} from "./dashboard.types";

// Search types
export type {
  LibrarySearchQuery,
  AirDCPPSearchData,
  SearchBarProps,
  SearchPageProps,
  FilterOption,
  FilterOptionConfig,
  ComicVineResourceType,
  ComicVineSearchResult,
  GlobalSearchBarProps,
} from "./search.types";

// Shared component types
export type {
  AlertVariant,
  AlertCardProps,
  CardProps,
  ProgressBarProps,
  StatsCardProps,
  T2TableProps,
  MetadataPanelProps,
  HeaderProps,
  DatePickerProps,
  PopoverButtonProps,
  TabulatedContentContainerProps,
  DownloadsProps,
  LibraryGridProps,
  SettingsProps,
} from "./shared.types";
