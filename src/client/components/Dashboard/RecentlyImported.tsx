import React, { ReactElement } from "react";
import Card from "../Carda";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import Masonry from "react-masonry-css";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";

type RecentlyImportedProps = {
  comicBookCovers: any;
};

export const RecentlyImported = ({
  comicBookCovers,
}: RecentlyImportedProps): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    600: 2,
  };

  return (
    <>
      <div className="content">
        <h4 className="title is-4">Recently Imported</h4>
        <p className="subtitle is-7">
          Recent Library activity such as imports, tagging, etc.
        </p>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="recent-comics-container"
        columnClassName="recent-comics-column"
      >
        {map(
          comicBookCovers.docs,
          ({ _id, rawFileDetails, sourcedMetadata }) => {
            const isComicBookMetadataAvailable =
              sourcedMetadata &&
              !isUndefined(sourcedMetadata.comicvine) &&
              !isUndefined(sourcedMetadata.comicvine.volumeInformation) &&
              !isEmpty(sourcedMetadata);
            let imagePath = "";
            let comicName = "";
            if (!isEmpty(rawFileDetails.cover)) {
              const encodedFilePath = encodeURI(
                `${LIBRARY_SERVICE_HOST}/${rawFileDetails.cover.filePath}`,
              );
              imagePath = escapePoundSymbol(encodedFilePath);
              comicName = rawFileDetails.name;
            } else if (!isEmpty(sourcedMetadata.comicvine)) {
              imagePath = sourcedMetadata.comicvine.image.small_url;
              comicName = sourcedMetadata.comicvine.name;
            }
            const titleElement = (
              <Link to={"/comic/details/" + _id}>
                {ellipsize(comicName, 20)}
              </Link>
            );
            return (
              <Card
                key={_id}
                orientation={"vertical"}
                imageUrl={imagePath}
                hasDetails
                title={comicName ? titleElement : null}
              >
                <div className="content is-flex is-flex-direction-row">
                  {isComicBookMetadataAvailable && (
                    <span className="icon custom-icon is-small">
                      <img src="/img/cvlogo.svg" />
                    </span>
                  )}
                  {/* Raw file presence  */}
                  {isNil(rawFileDetails) && (
                    <span className="icon custom-icon is-small has-text-danger mr-2">
                      <img src="/img/missing-file.svg" />
                    </span>
                  )}
                  {/* ComicInfo.xml presence */}
                  {!isNil(sourcedMetadata.comicInfo) && (
                    <span className="icon custom-icon is-small has-text-danger">
                      <img
                        src="/img/comicinfoxml.svg"
                        alt={"ComicInfo.xml file detected."}
                      />
                    </span>
                  )}
                  {/* Issue type */}
                  {isComicBookMetadataAvailable &&
                  !isNil(
                    detectIssueTypes(
                      sourcedMetadata.comicvine.volumeInformation.description,
                    ),
                  ) ? (
                    <span className="tag is-warning">
                      {
                        detectIssueTypes(
                          sourcedMetadata.comicvine.volumeInformation
                            .description,
                        ).displayName
                      }
                    </span>
                  ) : null}
                </div>
              </Card>
            );
          },
        )}
      </Masonry>
    </>
  );
};
