import React, { ReactElement } from "react";
import Card from "../shared/Carda";
import { Link, useNavigate } from "react-router-dom";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import Header from "../shared/Header";

type WantedComicsListProps = {
  comics: any;
};

export const WantedComicsList = ({
  comics,
}: WantedComicsListProps): ReactElement => {
  const navigate = useNavigate();

  return (
    <>
      <Header
        headerContent="Wanted Comics"
        subHeaderContent="Comics marked as wanted from various sources"
        iconClassNames="fa-solid fa-binoculars mr-2"
        link={"/wanted"}
      />
      <div className="grid grid-cols-5 gap-6 mt-3">
        {map(
          comics,
          ({
            _id,
            rawFileDetails,
            sourcedMetadata: { comicvine, comicInfo, locg },
            wanted,
          }) => {
            const isComicBookMetadataAvailable = !isUndefined(comicvine);
            const consolidatedComicMetadata = {
              rawFileDetails,
              comicvine,
              comicInfo,
              locg,
            };

            const {
              issueName,
              url,
              publisher = null,
            } = determineCoverFile(consolidatedComicMetadata);
            const titleElement = (
              <Link to={"/comic/details/" + _id}>
                {ellipsize(issueName, 20)}
                <p>{publisher}</p>
              </Link>
            );
            return (
              <Card
                key={_id}
                orientation={"vertical-2"}
                imageUrl={url}
                hasDetails
                title={issueName ? titleElement : <span>No Name</span>}
              >
                <div className="pb-1">
                  <div className="flex flex-row gap-2">
                    {/* Issue type */}
                    {isComicBookMetadataAvailable &&
                    !isNil(detectIssueTypes(comicvine.description)) ? (
                      <div className="my-2">
                        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          <span className="pr-1 pt-1">
                            <i className="icon-[solar--book-2-line-duotone] w-5 h-5"></i>
                          </span>

                          <span className="text-md text-slate-500 dark:text-slate-900">
                            {
                              detectIssueTypes(comicvine.description)
                                .displayName
                            }
                          </span>
                        </span>
                      </div>
                    ) : null}
                    {/* issues marked as wanted, part of this volume */}
                    {wanted?.markEntireVolumeWanted ? (
                      <div className="text-sm">sagla volume pahije</div>
                    ) : (
                      <div className="my-2">
                        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          <span className="pr-1 pt-1">
                            <i className="icon-[solar--documents-bold-duotone] w-5 h-5"></i>
                          </span>

                          <span className="text-md text-slate-500 dark:text-slate-900">
                            {wanted.issues.length}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  {/* comicVine metadata presence */}
                  {isComicBookMetadataAvailable && (
                    <img
                      src="/src/client/assets/img/cvlogo.svg"
                      alt={"ComicVine metadata detected."}
                      className="inline-block w-6 h-6 md:w-7 md:h-7 flex-shrink-0 object-contain"
                    />
                  )}
                  {!isEmpty(locg) && (
                    <img
                      src="/src/client/assets/img/locglogo.svg"
                      className="w-7 h-7"
                    />
                  )}
                </div>
              </Card>
            );
          },
        )}
      </div>
    </>
  );
};
