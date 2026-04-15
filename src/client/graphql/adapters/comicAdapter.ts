/**
 * @fileoverview Adapter functions for transforming GraphQL responses to legacy formats.
 * Enables gradual migration from REST API to GraphQL while maintaining backward
 * compatibility with existing components and data structures.
 * @module graphql/adapters/comicAdapter
 */

import { GetComicByIdQuery } from '../generated';

/**
 * @typedef {Object} LegacyComicFormat
 * @property {string} _id - Comic document ID
 * @property {Object} rawFileDetails - Original file information
 * @property {Object} inferredMetadata - Auto-detected metadata from parsing
 * @property {Object} sourcedMetadata - Metadata from external sources (ComicVine, LOCG, etc.)
 * @property {Object} acquisition - Download/acquisition tracking data
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {Object} __graphql - Original GraphQL response for forward compatibility
 */

/**
 * Transforms a GraphQL Comic query response to the legacy REST API format.
 * This adapter enables gradual migration by allowing components to work with
 * both new GraphQL data and legacy data structures.
 *
 * Handles:
 * - Parsing stringified JSON in sourcedMetadata fields
 * - Building inferredMetadata from canonical metadata as fallback
 * - Mapping rawFileDetails to expected structure
 * - Preserving original GraphQL data for forward compatibility
 *
 * @param {GetComicByIdQuery['comic']} graphqlComic - The GraphQL comic response object
 * @returns {LegacyComicFormat|null} Transformed comic in legacy format, or null if input is null
 * @example
 * const { data } = useGetComicByIdQuery({ id: comicId });
 * const legacyComic = adaptGraphQLComicToLegacy(data?.comic);
 * // legacyComic now has _id, rawFileDetails, sourcedMetadata, etc.
 */
export function adaptGraphQLComicToLegacy(graphqlComic: GetComicByIdQuery['comic']) {
  if (!graphqlComic) return null;

  // Parse sourced metadata (GraphQL returns as strings)
  const comicvine = graphqlComic.sourcedMetadata?.comicvine
    ? (typeof graphqlComic.sourcedMetadata.comicvine === 'string'
        ? JSON.parse(graphqlComic.sourcedMetadata.comicvine)
        : graphqlComic.sourcedMetadata.comicvine)
    : undefined;

  const comicInfo = graphqlComic.sourcedMetadata?.comicInfo
    ? (typeof graphqlComic.sourcedMetadata.comicInfo === 'string'
        ? JSON.parse(graphqlComic.sourcedMetadata.comicInfo)
        : graphqlComic.sourcedMetadata.comicInfo)
    : undefined;

  const locg = graphqlComic.sourcedMetadata?.locg || undefined;

  // Use inferredMetadata from GraphQL response, or build from canonical metadata as fallback
  const inferredMetadata = graphqlComic.inferredMetadata || {
    issue: {
      name: graphqlComic.canonicalMetadata?.title?.value ||
            graphqlComic.canonicalMetadata?.series?.value ||
            graphqlComic.rawFileDetails?.name || '',
      number: graphqlComic.canonicalMetadata?.issueNumber?.value
        ? parseInt(graphqlComic.canonicalMetadata.issueNumber.value, 10)
        : undefined,
      year: graphqlComic.canonicalMetadata?.publicationDate?.value?.substring(0, 4) ||
            graphqlComic.canonicalMetadata?.coverDate?.value?.substring(0, 4),
      subtitle: graphqlComic.canonicalMetadata?.series?.value,
    },
  };

  // Build acquisition data (if available from importStatus or other fields)
  const acquisition = {
    directconnect: {
      downloads: [],
    },
    torrent: [],
  };

  // Transform rawFileDetails to match expected format
  const rawFileDetails = graphqlComic.rawFileDetails ? {
    name: graphqlComic.rawFileDetails.name || '',
    filePath: graphqlComic.rawFileDetails.filePath,
    fileSize: graphqlComic.rawFileDetails.fileSize,
    extension: graphqlComic.rawFileDetails.extension,
    mimeType: graphqlComic.rawFileDetails.mimeType,
    containedIn: graphqlComic.rawFileDetails.containedIn,
    pageCount: graphqlComic.rawFileDetails.pageCount,
    archive: graphqlComic.rawFileDetails.archive,
    cover: graphqlComic.rawFileDetails.cover,
  } : undefined;

  return {
    _id: graphqlComic.id,
    rawFileDetails,
    inferredMetadata,
    sourcedMetadata: {
      comicvine,
      locg,
      comicInfo,
    },
    acquisition,
    createdAt: graphqlComic.createdAt || new Date().toISOString(),
    updatedAt: graphqlComic.updatedAt || new Date().toISOString(),
    // Include the full GraphQL data for components that can use it
    __graphql: graphqlComic,
  } as any; // Use 'as any' to bypass strict type checking during migration
}
