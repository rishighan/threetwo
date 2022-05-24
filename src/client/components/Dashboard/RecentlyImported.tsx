import React, { ReactElement } from "react";
import Card from "../Carda";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import Masonry from "react-masonry-css";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import {
  determineCoverFile,
  determineExternalMetadata,
} from "../../shared/utils/metadata.utils";

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
          ({
            _id,
            rawFileDetails,
            sourcedMetadata: { comicvine, comicInfo, locg },
            acquisition: {
              source: { name },
            },
          }) => {
            const { issueName, url } = determineCoverFile({
              rawFileDetails,
              comicvine,
              comicInfo,
              locg,
            });
            const { issue, coverURL, icon } = determineExternalMetadata(name, {
              comicvine,
              comicInfo,
              locg,
            });

            const isComicBookMetadataAvailable =
              !isUndefined(comicvine) &&
              !isUndefined(comicvine.volumeInformation);

            const titleElement = (
              <Link to={"/comic/details/" + _id}>
                {ellipsize(issueName, 20)}
              </Link>
            );
            return (
              <>
                <Card
                  key={_id}
                  orientation={"vertical"}
                  imageUrl={url}
                  hasDetails
                  title={issueName ? titleElement : null}
                >
                  <div className="content is-flex is-flex-direction-row">
                    {/* Raw file presence  */}
                    {isNil(rawFileDetails) && (
                      <span className="icon custom-icon is-small has-text-danger mr-2">
                        <img src="/img/missing-file.svg" />
                      </span>
                    )}
                    {/* ComicInfo.xml presence */}
                    {!isNil(comicInfo) && !isEmpty(comicInfo) && (
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
                {/* metadata card */}
                {!isNil(name) ? (
                  <Card orientation="horizontal" hasDetails imageUrl={coverURL}>
                    <dd className="is-size-9">
                      <dl>
                        <span className="icon custom-icon">
                          <img src={`/img/${icon}`} />
                        </span>
                      </dl>
                      <dl>
                        <span className="small-tag">
                          {ellipsize(issue, 15)}
                        </span>
                      </dl>
                    </dd>
                  </Card>
                ) : null}
              </>
            );
          },
        )}
      </Masonry>
    </>
  );
};
