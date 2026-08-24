/**
 * @fileoverview Utility functions for string formatting and text manipulation.
 * @module shared/utils/formatting
 */

/**
 * Removes a leading period character from a string if present.
 * Useful for normalizing file extensions or dotfile names.
 *
 * @param {string} input - The input string to process
 * @returns {string} The input string with the leading period removed, if one existed
 * @example
 * removeLeadingPeriod(".txt") // returns "txt"
 * removeLeadingPeriod("txt")  // returns "txt"
 */
export const removeLeadingPeriod = (input: string): string => {
  if (input.charAt(0) == ".") {
    input = input.substr(1);
  }
  return input;
};

/**
 * Escapes pound/hash symbols (#) in a string by replacing them with URL-encoded equivalent (%23).
 * Useful for preparing strings to be used in URLs or file paths.
 *
 * @param {string} input - The input string containing pound symbols to escape
 * @returns {string} The input string with all # characters replaced with %23
 * @example
 * escapePoundSymbol("Issue #123") // returns "Issue %23123"
 */
export const escapePoundSymbol = (input: string): string => {
  return input.replace(/\#/gm, "%23");
};

/**
 * Represents a comic book document with various metadata sources.
 * Used for displaying comic information across the application.
 *
 * @interface ComicBookDocument
 * @property {string} id - Unique identifier for the comic book document
 * @property {Object} [canonicalMetadata] - User-verified or authoritative metadata
 * @property {Object} [canonicalMetadata.series] - Series information
 * @property {string|null} [canonicalMetadata.series.value] - Series name
 * @property {Object} [canonicalMetadata.issueNumber] - Issue number information
 * @property {string|number|null} [canonicalMetadata.issueNumber.value] - Issue number
 * @property {Object} [inferredMetadata] - Automatically detected metadata from file parsing
 * @property {Object} [inferredMetadata.issue] - Issue information
 * @property {string|null} [inferredMetadata.issue.name] - Inferred series/issue name
 * @property {string|number|null} [inferredMetadata.issue.number] - Inferred issue number
 * @property {Object} [rawFileDetails] - Original file information
 * @property {string|null} [rawFileDetails.name] - Original filename
 */
interface ComicBookDocument {
  id: string;
  canonicalMetadata?: {
    series?: { value?: string | null } | null;
    issueNumber?: { value?: string | number | null } | null;
  } | null;
  inferredMetadata?: {
    issue?: { name?: string | null; number?: string | number | null } | null;
  } | null;
  rawFileDetails?: {
    name?: string | null;
  } | null;
}

/**
 * Generates a display label for a comic book from its metadata.
 * Prioritizes canonical metadata, falls back to inferred, then raw file name.
 *
 * @param {ComicBookDocument} comic - The comic book document object
 * @returns {string} A formatted string like "Series Name #123" or the file name as fallback
 * @example
 * // With full canonical metadata
 * getComicDisplayLabel({ id: "1", canonicalMetadata: { series: { value: "Batman" }, issueNumber: { value: 42 } } })
 * // returns "Batman #42"
 *
 * @example
 * // Fallback to raw file name
 * getComicDisplayLabel({ id: "1", rawFileDetails: { name: "batman-042.cbz" } })
 * // returns "batman-042.cbz"
 */
export const getComicDisplayLabel = (comic: ComicBookDocument): string => {
  const series =
    comic.canonicalMetadata?.series?.value ??
    comic.inferredMetadata?.issue?.name;
  const issueNum =
    comic.canonicalMetadata?.issueNumber?.value ??
    comic.inferredMetadata?.issue?.number;
  if (series && issueNum) return `${series} #${issueNum}`;
  if (series) return series;
  return comic.rawFileDetails?.name ?? comic.id;
};
