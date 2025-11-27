import React, { ReactElement } from "react";
import Card from "../shared/Carda";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import {
  determineCoverFile,
  determineExternalMetadata,
} from "../../shared/utils/metadata.utils";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import Header from "../shared/Header";

type RecentlyImportedProps = {
  comics: any;
};

export const RecentlyImported = (
  comics: RecentlyImportedProps,
): ReactElement => {
  console.log(comics);
  return (
    <div>
      <div className="mx-auto" style={{ maxWidth: '1400px' }}>
        <Header
          headerContent="Recently Imported"
          subHeaderContent="Recent Library activity such as imports, tagging, etc."
          iconClassNames="fa-solid fa-binoculars mr-2"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6 mt-3">
        {comics?.comics.map(
          (
            {
              _id,
              rawFileDetails,
              sourcedMetadata: { comicvine, comicInfo, locg },
              inferredMetadata,
              wanted: { source } = {},
            },
            idx,
          ) => {
            const { issueName, url } = determineCoverFile({
              rawFileDetails,
              comicvine,
              comicInfo,
              locg,
            });
            const { issue, coverURL, icon } = determineExternalMetadata(
              source,
              {
                comicvine,
                comicInfo,
                locg,
              },
            );
            const isComicVineMetadataAvailable =
              !isUndefined(comicvine) &&
              !isUndefined(comicvine.volumeInformation);

            return (
              <Card
                orientation="vertical-2"
                key={idx}
                imageUrl={`${LIBRARY_SERVICE_HOST}/${rawFileDetails.cover.filePath}`}
                title={inferredMetadata.issue.name}
                hasDetails
              >
                <div>
                  <dd className="text-sm my-1 flex flex-row gap-1">
                    {/* Issue number */}
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--hashtag-outline]"></i>
                      </span>
                      <span className="text-md text-slate-900">
                        {inferredMetadata.issue.number}
                      </span>
                    </span>
                    {/* File extension */}
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--file-bold-duotone] w-4 h-4"></i>
                      </span>

                      <span className="text-md text-slate-500 dark:text-slate-900">
                        {rawFileDetails.extension}
                      </span>
                    </span>
                    {/* Uncompressed status  */}
                    {rawFileDetails?.archive?.uncompressed ? (
                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--bookmark-bold-duotone] w-4 h-4"></i>
                        </span>
                      </span>
                    ) : null}
                  </dd>
                </div>

                <div className="flex flex-row items-center gap-1 mt-2 pb-1">
                  <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
                    {/* ComicInfo.xml presence */}
                    {!isNil(comicInfo) && !isEmpty(comicInfo) && (
                      <div mt-1>
                        <i className="h-7 w-7 icon-[solar--code-file-bold-duotone] text-yellow-500 dark:text-yellow-300"></i>
                      </div>
                    )}
                    {/* ComicVine metadata presence */}
                    {isComicVineMetadataAvailable && (
                      <span className="w-7 h-7">
                        <img
                          src="/src/client/assets/img/cvlogo.svg"
                          alt={"ComicVine metadata detected."}
                        />
                      </span>
                    )}
                  </div>
                  {/* Raw file presence  */}
                  {isNil(rawFileDetails) && (
                    <span className="h-6 w-5 sm:shrink-0 sm:items-center sm:gap-2">
                      <i className="icon-[solar--file-corrupted-outline] h-5 w-5" />
                    </span>
                  )}
                </div>
              </Card>
            );
          },
        )}
        </div>
      </div>
    </div>
  );
};
