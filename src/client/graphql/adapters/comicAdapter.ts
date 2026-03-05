import { GetComicByIdQuery } from '../generated';

/**
 * Adapter to transform GraphQL Comic response to legacy REST API format
 * This allows gradual migration while maintaining compatibility with existing components
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
