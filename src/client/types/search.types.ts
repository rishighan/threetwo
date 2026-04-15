/**
 * @fileoverview Centralized type definitions for search functionality.
 * @module types/search.types
 */

import type {
  SearchQuery as AirDCPPSearchQuery,
  PriorityEnum,
} from "threetwo-ui-typings";

/**
 * Library search query structure.
 */
export type LibrarySearchQuery = {
  query: Record<string, any>;
  pagination: { size: number; from: number };
  type: string;
  trigger: string;
};

/**
 * AirDC++ search data configuration.
 */
export type AirDCPPSearchData = {
  query: Pick<AirDCPPSearchQuery, "pattern"> & Partial<Omit<AirDCPPSearchQuery, "pattern">>;
  hub_urls: string[] | undefined | null;
  priority: PriorityEnum;
};

/**
 * Props for SearchBar component.
 */
export type SearchBarProps = {
  data?: any;
  searchHandler?: (e: any) => void;
};

/**
 * Props for Search page component.
 */
export type SearchPageProps = Record<string, never>;

/**
 * Filter options for library.
 */
export type FilterOption = "all" | "missingFiles";

/**
 * Filter option configuration.
 */
export type FilterOptionConfig = {
  value: FilterOption;
  label: string;
};

/**
 * ComicVine search result resource types.
 */
export type ComicVineResourceType = "volume" | "issue";

/**
 * ComicVine search result structure.
 */
export type ComicVineSearchResult = {
  id: number;
  name?: string;
  deck?: string;
  api_detail_url?: string;
  image?: {
    small_url?: string;
    medium_url?: string;
    original_url?: string;
  };
  description?: string;
  volume?: {
    api_detail_url?: string;
    name?: string;
  };
  cover_date?: string;
  start_year?: string;
  count_of_issues?: number;
  publisher?: {
    name?: string;
  };
  issue_number?: string;
  resource_type?: ComicVineResourceType;
};

/**
 * Props for GlobalSearchBar component.
 */
export type GlobalSearchBarProps = {
  data?: any;
};
