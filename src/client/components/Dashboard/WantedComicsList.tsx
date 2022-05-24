import React, { ReactElement } from "react";
import Card from "../Carda";
import { Link, useNavigate } from "react-router-dom";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import Masonry from "react-masonry-css";
import { determineCoverFile } from "../../shared/utils/metadata.utils";

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

  const navigate = useNavigate();
  const navigateToWantedComics = (row) => {
    navigate(`/wanted/all`);
  };
  return (
    <>
      <div className="content">
        <a className="mb-1" onClick={navigateToWantedComics}>
          <span className="is-size-4 has-text-weight-semibold">
            Wanted Comics
          </span>
          <span className="icon mt-1">
            <i className="fa-solid fa-angle-right"></i>
          </span>
        </a>
        <p className="subtitle is-7">
          Comics marked as wanted from various sources.
        </p>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="recent-comics-container"
        columnClassName="recent-comics-column"
      >
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
                orientation={"vertical"}
                imageUrl={url}
                hasDetails
                title={issueName ? titleElement : <span>No Name</span>}
              >
                <div className="content is-flex is-flex-direction-row">
                  {/* comicVine metadata presence */}
                  {isComicBookMetadataAvailable && (
                    <span className="icon custom-icon">
                      <img src="/img/cvlogo.svg" />
                    </span>
                  )}
                  {!isEmpty(locg) && (
                    <span className="icon custom-icon">
                      <img src="/img/locglogo.svg" />
                    </span>
                  )}
                  {/* Issue type */}
                  {isComicBookMetadataAvailable &&
                  !isNil(
                    detectIssueTypes(comicvine.volumeInformation.description),
                  ) ? (
                    <span className="tag is-warning">
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
      </Masonry>
    </>
  );
};
