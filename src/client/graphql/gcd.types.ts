/**
 * @fileoverview GCD (Grand Comics Database) GraphQL Types
 * These types mirror the backend GCD schema with camelCase field names.
 * @module graphql/gcd.types
 */

// ─────────────────────────────────────────────────────────────────────────────
// Input Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GCDSeriesSearchInput {
  name: string;
  publisher?: string | null;
  yearBegan?: number | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GCDIssueSearchInput {
  seriesId?: number | null;
  number?: string | null;
  title?: string | null;
  publicationYear?: number | null;
  limit?: number | null;
  offset?: number | null;
}

export interface GCDScorerConfigInput {
  searchParams: GCDSearchParamsInput;
}

export interface GCDSearchParamsInput {
  name: string;
  issueNumber?: string | null;
  year?: string | null;
  subtitle?: string | null;
}

export interface GCDVolumeSearchInput {
  rawFileDetails?: Record<string, unknown> | null;
  scorerConfiguration: GCDScorerConfigInput;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GCDPublisher {
  __typename?: 'GCDPublisher';
  id: number;
  name: string;
  countryId?: number | null;
  yearBegan?: number | null;
  yearEnded?: number | null;
  url?: string | null;
}

export interface GCDSeries {
  __typename?: 'GCDSeries';
  id: number;
  name: string;
  sortName?: string | null;
  yearBegan?: number | null;
  yearEnded?: number | null;
  issueCount?: number | null;
  publisher?: GCDPublisher | null;
  notes?: string | null;
}

export interface GCDSeriesRef {
  __typename?: 'GCDSeriesRef';
  id: number;
  name: string;
  yearBegan?: number | null;
  publisher?: {
    id: number;
    name: string;
  } | null;
}

export interface GCDIssue {
  __typename?: 'GCDIssue';
  id: number;
  issueNumber?: string | null;
  publicationDate?: string | null;
  keyDate?: string | null;
  price?: string | null;
  pageCount?: number | null;
  isbn?: string | null;
  barcode?: string | null;
  notes?: string | null;
  series?: GCDSeriesRef | null;
  variantName?: string | null;
}

export interface GCDStory {
  __typename?: 'GCDStory';
  id: number;
  title?: string | null;
  feature?: string | null;
  typeId?: number | null;
  pageCount?: number | null;
  script?: string | null;
  pencils?: string | null;
  inks?: string | null;
  colors?: string | null;
  letters?: string | null;
  editing?: string | null;
  characters?: string | null;
  synopsis?: string | null;
  notes?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search Result Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GCDSeriesSearchResult {
  __typename?: 'GCDSeriesSearchResult';
  count: number;
  results: GCDSeries[];
  hasMore: boolean;
  nextOffset?: number | null;
}

export interface GCDIssueSearchResult {
  __typename?: 'GCDIssueSearchResult';
  count: number;
  results: GCDIssue[];
  hasMore: boolean;
  nextOffset?: number | null;
}

export interface ScoredGCDMatch {
  __typename?: 'ScoredGCDMatch';
  score: number;
  nameMatchScore?: number | null;
  yearMatchScore?: number | null;
  issue: GCDIssue;
  series: GCDSeries;
}

export interface GCDVolumeSearchResult {
  __typename?: 'GCDVolumeSearchResult';
  finalMatches: ScoredGCDMatch[];
  rawFileDetails?: Record<string, unknown> | null;
  scorerConfiguration?: Record<string, unknown> | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GCDDatabaseStatus {
  __typename?: 'GCDDatabaseStatus';
  connected: boolean;
  seriesCount?: number | null;
  issueCount?: number | null;
  storyCount?: number | null;
  publisherCount?: number | null;
}

export interface GCDHealthResponse {
  __typename?: 'GCDHealthResponse';
  status: string;
  database?: GCDDatabaseStatus | null;
  lastUpdated?: string | null;
  message?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Variables Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GcdHealthQueryVariables {}

export interface SearchGcdSeriesQueryVariables {
  input: GCDSeriesSearchInput;
}

export interface GetGcdSeriesByIdQueryVariables {
  id: number;
}

export interface SearchGcdIssuesQueryVariables {
  input: GCDIssueSearchInput;
}

export interface GetGcdIssueByIdQueryVariables {
  id: number;
}

export interface GetGcdStoriesForIssueQueryVariables {
  issueId: number;
}

export interface GcdVolumeBasedSearchQueryVariables {
  input: GCDVolumeSearchInput;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GcdHealthQuery {
  __typename?: 'Query';
  gcdHealth: GCDHealthResponse;
}

export interface SearchGcdSeriesQuery {
  __typename?: 'Query';
  searchGCDSeries: GCDSeriesSearchResult;
}

export interface GetGcdSeriesByIdQuery {
  __typename?: 'Query';
  getGCDSeriesById: GCDSeries | null;
}

export interface SearchGcdIssuesQuery {
  __typename?: 'Query';
  searchGCDIssues: GCDIssueSearchResult;
}

export interface GetGcdIssueByIdQuery {
  __typename?: 'Query';
  getGCDIssueById: GCDIssue | null;
}

export interface GetGcdStoriesForIssueQuery {
  __typename?: 'Query';
  getGCDStoriesForIssue: GCDStory[];
}

export interface GcdVolumeBasedSearchQuery {
  __typename?: 'Query';
  gcdVolumeBasedSearch: GCDVolumeSearchResult;
}
