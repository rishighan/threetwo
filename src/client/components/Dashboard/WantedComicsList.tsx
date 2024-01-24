import React, { ReactElement } from "react";
import Card from "../shared/Carda";
import { Link, useNavigate } from "react-router-dom";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import { determineCoverFile } from "../../shared/utils/metadata.utils";

type WantedComicsListProps = {
  comics: any;
};

export const WantedComicsList = ({
  comics,
}: WantedComicsListProps): ReactElement => {
  console.log("yolo", comics);
  const navigate = useNavigate();
  const navigateToWantedComics = (row) => {
    navigate(`/wanted/all`);
  };
  return (
    <>
      <div className="mt-7">
        <a className="" onClick={navigateToWantedComics}>
          <span className="text-xl">
            <i className=""></i> Wanted Comics
          </span>
          <span className="">
            <i className=""></i>
          </span>
        </a>
        <p className="">Comics marked as wanted from various sources.</p>
      </div>
      <div className="grid grid-cols-5 gap-6 mt-3">
        {map(
          comics,
          ({
            _id,
            rawFileDetails,
            sourcedMetadata: { comicvine, comicInfo, locg },
          }) => {
            const isComicBookMetadataAvailable =
              !isUndefined(comicvine) &&
              !isUndefined(comicvine.volumeInformation);
            const consolidatedComicMetadata = {
              rawFileDetails,
              comicvine,
              comicInfo,
              locg,
            };

            const { issueName, url } = determineCoverFile(
              consolidatedComicMetadata,
            );
            const titleElement = (
              <Link to={"/comic/details/" + _id}>
                {ellipsize(issueName, 20)}
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
                  {/* comicVine metadata presence */}
                  {isComicBookMetadataAvailable && (
                    <img
                      src="/src/client/assets/img/cvlogo.svg"
                      alt={"ComicVine metadata detected."}
                      className="w-7 h-7"
                    />
                  )}
                  {!isEmpty(locg) && (
                    <img
                      src="/src/client/assets/img/locglogo.svg"
                      className="w-7 h-7"
                    />
                  )}
                  {/* Issue type */}
                  {isComicBookMetadataAvailable &&
                  !isNil(
                    detectIssueTypes(comicvine.volumeInformation.description),
                  ) ? (
                    <span className="">
                      {
                        detectIssueTypes(
                          comicvine.volumeInformation.description,
                        ).displayName
                      }
                    </span>
                  ) : null}
                </div>
              </Card>
            );
          },
        )}
      </div>
    </>
  );
};
