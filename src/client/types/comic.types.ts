/**
 * @fileoverview Centralized type definitions for ComicDetail components.
 * @module types/comic.types
 */

import type { ReactElement } from "react";
import type { RawFileDetails as RawFileDetailsType, InferredMetadata } from "../graphql/generated";

/**
 * ComicVine metadata structure from sourced metadata.
 */
export type ComicVineMetadata = {
  name?: string;
  volumeInformation?: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Acquisition data for a comic (downloads, torrents, etc.).
 */
export type Acquisition = {
  directconnect?: {
    downloads?: unknown[];
  };
  torrent?: unknown[];
  [key: string]: unknown;
};

/**
 * Props for the ComicDetail component.
 */
export type ComicDetailProps = {
  data: {
    _id: string;
    rawFileDetails?: RawFileDetailsType;
    inferredMetadata: InferredMetadata;
    sourcedMetadata: {
      comicvine?: ComicVineMetadata;
      locg?: Record<string, unknown>;
      comicInfo?: Record<string, unknown>;
    };
    acquisition?: Acquisition;
    createdAt: string;
    updatedAt: string;
  };
  userSettings?: Record<string, unknown>;
  queryClient?: unknown;
  comicObjectId?: string;
};

/**
 * Tab configuration for ComicDetail tabs.
 */
export type TabConfig = {
  id: number;
  name: string;
  icon: ReactElement;
  content: ReactElement | null;
  shouldShow: boolean;
};

/**
 * Parameters for creating tab configuration.
 */
export type TabConfigParams = {
  data: any;
  hasAnyMetadata: boolean;
  areRawFileDetailsAvailable: boolean;
  airDCPPQuery: any;
  comicObjectId: string;
  userSettings: any;
  issueName: string;
  acquisition?: any;
  onReconcileMetadata?: () => void;
};

/**
 * Props for ComicVineMatchPanel component.
 */
export type ComicVineMatchPanelProps = {
  props: {
    rawFileDetails?: RawFileDetailsType;
    comicVineMatches: any;
    comicObjectId: string;
    inferredMetadata?: InferredMetadata;
    queryClient?: unknown;
    onMatchApplied?: () => void;
  };
};

/**
 * Props for MatchResult component.
 */
export type MatchResultProps = {
  matchData: any;
  comicObjectId: string;
  queryClient?: any;
  onMatchApplied?: () => void;
};

/**
 * Props for AcquisitionPanel component.
 */
export type AcquisitionPanelProps = {
  query: any;
  comicObjectId: any;
  comicObject: any;
  settings: any;
};

/**
 * Props for ComicVineDetails component.
 */
export type ComicVineDetailsProps = {
  updatedAt?: string;
  data?: {
    name?: string;
    number?: string;
    resource_type?: string;
    id?: number;
    volumeInformation?: any;
    issue_number?: string;
    description?: string;
  };
};

/**
 * Props for CVMatchesPanel in SlidingPanelContent.
 */
export type CVMatchesPanelProps = {
  rawFileDetails?: RawFileDetailsType;
  comicVineMatches: any;
  comicObjectId: string;
  inferredMetadata?: InferredMetadata;
  queryClient?: unknown;
  onMatchApplied?: () => void;
};

/**
 * Props for EditMetadataPanel component.
 */
export type EditMetadataPanelProps = {
  data: {
    rawFileDetails: any;
    comicObjectId: string;
  };
};

/**
 * Props for DownloadProgressTick component.
 */
export type DownloadProgressTickProps = {
  bundleId: string;
};

/**
 * Data structure for download tick.
 */
export type DownloadTickData = {
  id: number;
  name: string;
  type: {
    id: string;
    str: string;
    content_type: string;
  };
  target: string;
  speed: number;
  seconds_left: number;
  bytes_downloaded: number;
  size: number;
  status: {
    id: string;
    str: string;
  };
  time_finished: number;
  time_added: number;
};

/**
 * Props for AsyncSelectPaginate component.
 */
export type AsyncSelectPaginateProps = {
  metronResource: string;
  metronResourceId?: string;
  value?: any;
  onChange?: (value: any) => void;
};

/**
 * Sourced metadata structure for VolumeInformation.
 */
export type SourcedMetadata = {
  comicvine?: ComicVineMetadata;
  locg?: Record<string, unknown>;
  comicInfo?: Record<string, unknown>;
};

/**
 * Data structure for VolumeInformation component.
 */
export type VolumeInformationData = {
  id?: string;
  _id?: string;
  sourcedMetadata?: SourcedMetadata;
  rawFileDetails?: RawFileDetailsType;
};

/**
 * Props for VolumeInformation component.
 */
export type VolumeInformationProps = {
  data: VolumeInformationData;
  onReconcile?: () => void;
};

/**
 * Props for ScalarCell in ReconcilerDrawer.
 */
export type ScalarCellProps = {
  value: string | null;
  isSelected?: boolean;
  onClick?: () => void;
};
