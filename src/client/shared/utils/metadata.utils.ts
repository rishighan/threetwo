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
 * @typedef {Object} CoverFileEntry
 * @property {string} objectReference - Reference key to the source object
 * @property {number} priority - Priority level for cover selection (lower = higher priority)
 * @property {string} url - URL to the cover image
 * @property {string} issueName - Name of the comic issue
 * @property {string} publisher - Publisher name
 */

/**
 * @typedef {Object} ComicMetadataPayload
 * @property {Object} [rawFileDetails] - Raw file information from the filesystem
 * @property {Object} [rawFileDetails.cover] - Cover image details
 * @property {string} [rawFileDetails.cover.filePath] - Path to the cover file
 * @property {string} [rawFileDetails.name] - File name
 * @property {Object} [wanted] - Wanted list metadata
 * @property {Object} [comicInfo] - ComicInfo.xml metadata
 * @property {Object} [comicvine] - ComicVine API metadata
 * @property {Object} [comicvine.image] - Image information
 * @property {string} [comicvine.image.small_url] - Small cover image URL
 * @property {string} [comicvine.name] - Issue name from ComicVine
 * @property {Object} [comicvine.publisher] - Publisher information
 * @property {string} [comicvine.publisher.name] - Publisher name
 * @property {Object} [locg] - League of Comic Geeks metadata
 * @property {string} [locg.cover] - Cover image URL
 * @property {string} [locg.name] - Issue name
 * @property {string} [locg.publisher] - Publisher name
 */

/**
 * Determines the best available cover file from multiple metadata sources.
 * Evaluates sources in priority order: rawFileDetails (1), wanted (2), comicvine (3), locg (4).
 * Returns the highest priority source that has a valid cover URL.
 *
 * @param {ComicMetadataPayload} data - The comic metadata object containing multiple sources
 * @returns {CoverFileEntry} The cover file entry with the highest priority that has a URL,
 *                           or the rawFile entry if no covers are available
 * @example
 * const cover = determineCoverFile({
 *   rawFileDetails: { name: "Batman #1.cbz", cover: { filePath: "covers/batman-1.jpg" } },
 *   comicvine: { image: { small_url: "https://comicvine.com/..." }, name: "Batman" }
 * });
 * // Returns rawFileDetails cover (priority 1) if available
 */
export const determineCoverFile = (data): any => {
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
    coverFile.comicvine.url = data?.comicvine?.image?.small_url;
    coverFile.comicvine.issueName = data.comicvine?.name;
    coverFile.comicvine.publisher = data.comicvine?.publisher?.name;
  }

  // Extract raw file details
  if (!isEmpty(data.rawFileDetails) && data.rawFileDetails.cover?.filePath) {
    const encodedFilePath = encodeURI(
      `${LIBRARY_SERVICE_HOST}/${data.rawFileDetails.cover.filePath}`,
    );
    coverFile.rawFile.url = escapePoundSymbol(encodedFilePath);
    coverFile.rawFile.issueName = data.rawFileDetails.name;
  } else if (!isEmpty(data.rawFileDetails)) {
    coverFile.rawFile.issueName = data.rawFileDetails.name;
  }

  // Extract League of Comic Geeks metadata
  if (!isNil(data.locg)) {
    coverFile.locg.url = data.locg.cover;
    coverFile.locg.issueName = data.locg.name;
    coverFile.locg.publisher = data.locg.publisher;
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
