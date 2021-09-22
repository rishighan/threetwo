import React, { ReactElement } from "react";
import Card from "./Carda";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { isEmpty, isNil, map } from "lodash";
import { detectTradePaperbacks } from "../shared/utils/tradepaperback.utils";
import Masonry from "react-masonry-css";

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
    500: 1,
  };
  return (
    <>
      <h2 className="subtitle">Recently Imported</h2>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="recent-comics-container"
        columnClassName="recent-comics-column"
      >
        {map(
          comicBookCovers.docs,
          ({ _id, rawFileDetails, sourcedMetadata }) => {
            let imagePath = "";
            let comicName = "";
            if (!isNil(rawFileDetails)) {
              const encodedFilePath = encodeURI(
                "http://localhost:3000" +
                  removeLeadingPeriod(rawFileDetails.path),
              );
              imagePath = escapePoundSymbol(encodedFilePath);
              comicName = rawFileDetails.name;
            } else if (!isNil(sourcedMetadata)) {
              imagePath = sourcedMetadata.comicvine.image.small_url;
              comicName = sourcedMetadata.comicvine.name;
            }
            const titleElement = (
              <Link to={"/comic/details/" + _id}>
                {ellipsize(comicName, 18)}
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
                  {!isNil(sourcedMetadata.comicvine) && (
                    <span className="icon cv-icon is-small">
                      <img src="/dist/img/cvlogo.svg" />
                    </span>
                  )}
                  {isNil(rawFileDetails) && (
                    <span className="icon has-text-info">
                      <i className="fas fa-adjust" />
                    </span>
                  )}
                  {!isNil(sourcedMetadata.comicvine) &&
                  !isEmpty(
                    detectTradePaperbacks(
                      sourcedMetadata.comicvine.volumeInformation.description,
                    ),
                  ) ? (
                    <span className="tag is-warning">TPB</span>
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
