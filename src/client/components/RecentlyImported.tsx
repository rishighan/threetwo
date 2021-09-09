import React, { ReactElement } from "react";
import Card from "./Carda";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { isNil, map } from "lodash";

type RecentlyImportedProps = {
  comicBookCovers: any;
};

export const RecentlyImported = ({
  comicBookCovers,
}: RecentlyImportedProps): ReactElement => (
  <section className="card-container">
    {map(comicBookCovers.docs, ({ _id, rawFileDetails, sourcedMetadata }) => {
      let imagePath = "";
      let comicName = "";
      if (!isNil(rawFileDetails)) {
        const encodedFilePath = encodeURI(
          "http://localhost:3000" + removeLeadingPeriod(rawFileDetails.path),
        );
        imagePath = escapePoundSymbol(encodedFilePath);
        comicName = rawFileDetails.name;
      } else if (!isNil(sourcedMetadata)) {
        imagePath = sourcedMetadata.comicvine.image.small_url;
        comicName = sourcedMetadata.comicvine.name;
      }
      const titleElement = (
        <Link to={"/comic/details/" + _id}>{ellipsize(comicName, 18)}</Link>
      );
      return (
        <Card
          key={_id}
          orientation={"vertical"}
          imageUrl={imagePath}
          hasDetails
          title={comicName ? titleElement : null}
        >
          {!isNil(sourcedMetadata.comicvine) && (
            <div className="content is-flex is-flex-direction-row">
              <span className="icon cv-icon is-small">
                <img src="/dist/img/cvlogo.svg" />
              </span>
              <i className="fas fa-paper-plane is-small has-text-warning has-text-light"></i>
            </div>
          )}
        </Card>
      );
    })}
  </section>
);
