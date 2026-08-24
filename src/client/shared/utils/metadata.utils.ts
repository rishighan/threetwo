/**
 * @fileoverview Utility functions for handling comic metadata from various sources.
 * Provides functions to determine cover images and external metadata from
 * sources like ComicVine, League of Comic Geeks (LOCG), and raw file details.
 * @module shared/utils/metadata
 */

import { filter, isEmpty, isNil, isUndefined, min, minBy } from "lodash";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { escapePoundSymbol } from "./formatting.utils";

/**
 * Shape of the raw comic record passed into {@link determineCoverFile}.
 * All source buckets are optional; the function gracefully handles any combination.
 */
interface CoverFileData {
  /** Filesystem-level details extracted directly from the comic archive. */
  rawFileDetails?: {
    /** Cover image extracted from the archive, if present. */
    cover?: {
      /** Server-relative path to the cover image file. */
      filePath?: string | null;
    } | null;
    /** Original filename of the comic archive. */
    name?: string | null;
  } | null;
  /** Metadata fetched from the ComicVine API. */
  comicvine?: {
    /** Image object returned by ComicVine. */
    image?: {
      /** URL of the small cover thumbnail. */
      small_url?: string | null;
    } | null;
    /** Issue name as returned by ComicVine. */
    name?: string | null;
    /** Publisher information from ComicVine. */
    publisher?: {
      /** Publisher display name. */
      name?: string | null;
    } | null;
  } | null;
  /** Metadata fetched from League of Comic Geeks. */
  locg?: {
    /** Direct URL to the cover image hosted by LOCG. */
    cover?: string | null;
    /** Issue name as listed on LOCG. */
    name?: string | null;
    /** Publisher name as listed on LOCG. */
    publisher?: string | null;
  } | null;
  /** Wanted-list entry for this comic. */
  wanted?: unknown;
  /** Metadata parsed from an embedded ComicInfo.xml. */
  comicInfo?: unknown;
}

export type { CoverFileData };

/**
 * Resolved cover entry returned by {@link determineCoverFile}.
 */
interface CoverFileEntry {
  /** Key identifying which source this entry came from (`"rawFileDetails"`, `"comicvine"`, `"locg"`, or `"wanted"`). */
  objectReference: string;
  /** Source priority used for selection — lower value wins (1 = rawFileDetails, 4 = locg). */
  priority: number;
  /** Fully-qualified URL to the cover image, or an empty string if unavailable. */
  url: string;
  /** Display name of the comic issue. */
  issueName: string;
  /** Publisher display name. */
  publisher: string;
}

/**
 * Determines the best available cover image from multiple metadata sources.
 *
 * Sources are evaluated in priority order:
 * 1. `rawFileDetails` — extracted directly from the comic archive
 * 2. `wanted` — from the wanted list
 * 3. `comicvine` — from the ComicVine API
 * 4. `locg` — from League of Comic Geeks
 *
 * The entry with the lowest priority number that has a non-empty `url` is returned.
 * If no source yields a URL, the `rawFileDetails` entry is returned so that the
 * issue name is still available for display.
 *
 * @param data - Comic record containing one or more metadata source buckets.
 * @returns The highest-priority {@link CoverFileEntry} with a valid cover URL,
 *          or the bare `rawFileDetails` entry when no covers are available.
 *
 * @example
 * const cover = determineCoverFile({
 *   rawFileDetails: { name: "Batman #1.cbz", cover: { filePath: "/covers/batman-1.jpg" } },
 *   comicvine: { image: { small_url: "https://comicvine.com/..." }, name: "Batman #1" },
 * });
 * // → rawFileDetails entry (priority 1) because it has a filePath
 */
export const determineCoverFile = (data: CoverFileData): CoverFileEntry => {
  const coverFile = {
    rawFile: {
      objectReference: "rawFileDetails",
      priority: 1,
      url: "",
      issueName: "",
      publisher: "",
    },
    wanted: {
      objectReference: "wanted",
      priority: 2,
      url: "",
      issueName: "",
      publisher: "",
    },
    comicvine: {
      objectReference: "comicvine",
      priority: 3,
      url: "",
      issueName: "",
      publisher: "",
    },
    locg: {
      objectReference: "locg",
      priority: 4,
      url: "",
      issueName: "",
      publisher: "",
    },
  };

  // Extract ComicVine metadata
  if (!isEmpty(data.comicvine)) {
    coverFile.comicvine.url = data?.comicvine?.image?.small_url || "";
    coverFile.comicvine.issueName = data.comicvine?.name || "";
    coverFile.comicvine.publisher = data.comicvine?.publisher?.name || "";
  }

  // Extract raw file details
  if (!isEmpty(data.rawFileDetails) && data.rawFileDetails?.cover?.filePath) {
    const encodedFilePath = encodeURI(
      `${LIBRARY_SERVICE_HOST}${data.rawFileDetails.cover.filePath}`,
    );
    coverFile.rawFile.url = escapePoundSymbol(encodedFilePath);
    coverFile.rawFile.issueName = data.rawFileDetails.name || "";
  } else if (!isEmpty(data.rawFileDetails)) {
    coverFile.rawFile.issueName = data.rawFileDetails?.name || "";
  }

  // Extract League of Comic Geeks metadata
  if (!isNil(data.locg)) {
    coverFile.locg.url = data.locg.cover || "";
    coverFile.locg.issueName = data.locg.name || "";
    coverFile.locg.publisher = data.locg.publisher || "";
  }

  const result = filter(coverFile, (item) => item.url !== "");

  if (result.length >= 1) {
    const highestPriorityCoverFile = minBy(result, (item) => item.priority);
    if (!isUndefined(highestPriorityCoverFile)) {
      return highestPriorityCoverFile;
    }
  }

  // No cover URL available — return rawFile entry so the name is still shown
  return coverFile.rawFile;
};

/**
 * @typedef {Object} ExternalMetadataResult
 * @property {string} coverURL - URL to the cover image
 * @property {string} issue - Issue name or title
 * @property {string} icon - Icon filename for the metadata source
 */

/**
 * Extracts external metadata from a specific source.
 * Supports ComicVine and League of Comic Geeks (LOCG) as metadata sources.
 *
 * @param {string} metadataSource - The source identifier ("comicvine" or "locg")
 * @param {ComicMetadataPayload} source - The comic metadata object
 * @returns {ExternalMetadataResult|Object|null} The extracted metadata with cover URL, issue name,
 *                                                and source icon; empty object for undefined source;
 *                                                null if source data is nil
 * @example
 * const metadata = determineExternalMetadata("comicvine", {
 *   comicvine: { image: { small_url: "https://..." }, name: "Batman #1" }
 * });
 * // Returns { coverURL: "https://...", issue: "Batman #1", icon: "cvlogo.svg" }
 */
export const determineExternalMetadata = (
  metadataSource: string,
  source: any,
): any => {
  if (!isNil(source)) {
    switch (metadataSource) {
      case "comicvine":
        return {
          coverURL:
            source.comicvine?.image?.small_url ||
            source.comicvine?.volumeInformation?.image?.small_url,
          issue: source.comicvine.name,
          icon: "cvlogo.svg",
        };
      case "locg":
        return {
          coverURL: source.locg.cover,
          issue: source.locg.name,
          icon: "locglogo.svg",
        };
      case undefined:
        return {};

      default:
        break;
    }
  }
  return null;
};
