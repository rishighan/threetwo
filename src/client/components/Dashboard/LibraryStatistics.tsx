import React, { ReactElement } from "react";
import Header from "../shared/Header";
import { GetLibraryStatisticsQuery, DirectorySize } from "../../graphql/generated";

type Stats = Omit<GetLibraryStatisticsQuery["getLibraryStatistics"], "comicDirectorySize"> & {
  comicDirectorySize: DirectorySize;
  comicsMissingFiles: number;
};

/** Props for {@link LibraryStatistics}. */
interface LibraryStatisticsProps {
  stats: Stats | null | undefined;
}

/**
 * Displays a snapshot of library metrics: total comic files, tagging coverage,
 * file-type breakdown, and the publisher with the most issues.
 *
 * Returns `null` when `stats` is absent or the statistics array is empty.
 */
export const LibraryStatistics = ({ stats }: LibraryStatisticsProps): ReactElement | null => {
  if (!stats) return null;

  const facet = stats.statistics?.[0];
  if (!facet) return null;

  const { issues, issuesWithComicInfoXML, fileTypes, publisherWithMostComicsInLibrary } = facet;
  const topPublisher = publisherWithMostComicsInLibrary?.[0];

  return (
    <div className="mt-5">
      <Header
        headerContent="Your Library In Numbers"
        subHeaderContent={<span className="text-md">A brief snapshot of your library.</span>}
        iconClassNames="fa-solid fa-binoculars mr-2"
      />

      <div className="mt-3 flex flex-row gap-5">
        {/* Total records in database */}
        <div className="flex flex-col rounded-lg bg-card-info px-4 py-6 text-center">
          <dt className="text-lg font-medium text-gray-500">In database</dt>
          <dd className="text-3xl text-gray-700 md:text-5xl">
            {stats.totalDocuments} comics
          </dd>
        </div>

        {/* Missing files */}
        <div className="flex flex-col rounded-lg bg-card-missing px-4 py-6 text-center">
          <dt className="text-lg font-medium text-gray-500">Missing files</dt>
          <dd className="text-3xl text-red-600 md:text-5xl">
            {stats.comicsMissingFiles}
          </dd>
        </div>

        {/* Disk space consumed */}
        {stats.comicDirectorySize.totalSizeInGB != null && (
          <div className="flex flex-col rounded-lg bg-card-info px-4 py-6 text-center">
            <dt className="text-lg font-medium text-gray-500">Size on disk</dt>
            <dd className="text-3xl text-gray-700 md:text-5xl">
              {stats.comicDirectorySize.totalSizeInGB.toFixed(2)} GB
            </dd>
          </div>
        )}

        {/* Tagging coverage */}
        <div className="flex flex-col gap-4">
          {issues && issues.length > 0 && (
            <div className="flex flex-col h-fit rounded-lg bg-card-info px-4 py-3 text-center">
              <span className="text-xl text-gray-700">{issues.length}</span>
              tagged with ComicVine
            </div>
          )}
          {issuesWithComicInfoXML && issuesWithComicInfoXML.length > 0 && (
            <div className="flex flex-col h-fit rounded-lg bg-card-info px-4 py-3 text-center">
              <span className="text-xl text-gray-700">{issuesWithComicInfoXML.length}</span>
              with ComicInfo.xml
            </div>
          )}
        </div>

        {/* File-type breakdown */}
        {fileTypes && fileTypes.length > 0 && (
          <div>
            {fileTypes.map((ft) => (
              <span
                key={ft.id}
                className="flex flex-col mb-4 h-fit text-xl rounded-lg bg-card-info px-4 py-3 text-center text-gray-700"
              >
                {ft.data.length} {ft.id}
              </span>
            ))}
          </div>
        )}

        {/* Publisher with most issues */}
        {topPublisher && (
          <div className="flex flex-col h-fit text-lg rounded-lg bg-card-info px-4 py-3 text-gray-700">
            <span>{topPublisher.id}</span>
            {" has the most issues "}
            <span>{topPublisher.count}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryStatistics;
