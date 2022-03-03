import React, { ReactElement } from "react";
import Card from "../Carda";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import Masonry from "react-masonry-css";

type WantedComicsListProps = {
  comics: any;
};

export const WantedComicsList = ({
  comics,
}: WantedComicsListProps): ReactElement => {
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 2,
    600: 2,
  };

  return (
    <>
      <div className="content">
        <h4 className="title is-4">Wanted Comics</h4>
        <p className="subtitle is-7">
          Comics marked as wanted from various sources.
        </p>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="recent-comics-container"
        columnClassName="recent-comics-column"
      >
        {map(comics, ({ _id, rawFileDetails, sourcedMetadata }) => {
          const isComicBookMetadataAvailable =
            sourcedMetadata &&
            !isUndefined(sourcedMetadata.comicvine) &&
            !isUndefined(sourcedMetadata.comicvine.volumeInformation) &&
            !isEmpty(sourcedMetadata);
          let imagePath = "";
          let comicName = "";
          if (isComicBookMetadataAvailable) {
            imagePath = sourcedMetadata.comicvine.image.small_url;
            comicName = sourcedMetadata.comicvine.name;
          }
          const titleElement = (
            <Link to={"/comic/details/" + _id}>{ellipsize(comicName, 20)}</Link>
          );
          return (
            <Card
              key={_id}
              orientation={"vertical"}
              imageUrl={imagePath}
              hasDetails
              title={comicName ? titleElement : <span>No Name</span>}
            >
              <div className="content is-flex is-flex-direction-row">
                {isComicBookMetadataAvailable && (
                  <span className="icon custom-icon is-small">
                    <img src="/img/cvlogo.svg" />
                  </span>
                )}
                {/* Raw file presence  */}
                {isEmpty(rawFileDetails.cover) && (
                  <span className="icon custom-icon is-small has-text-danger mr-2">
                    <img src="/img/missing-file.svg" />
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
                        sourcedMetadata.comicvine.volumeInformation.description,
                      ).displayName
                    }
                  </span>
                ) : null}
              </div>
            </Card>
          );
        })}
      </Masonry>
    </>
  );
};
