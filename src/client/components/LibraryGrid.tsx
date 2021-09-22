import React, { useState, useEffect, useMemo, ReactElement } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable, usePagination } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { useDispatch, useSelector } from "react-redux";
import { getComicBooks } from "../actions/fileops.actions";
import { isNil, isEmpty } from "lodash";
import Masonry from "react-masonry-css";
import Card from "./Carda";
import { detectTradePaperbacks } from "../shared/utils/tradepaperback.utils";
import { Link } from "react-router-dom";

interface ILibraryGridProps {}
export const LibraryGrid = (libraryGridProps: ILibraryGridProps) => {
  const data = useSelector(
    (state: RootState) => state.fileOps.recentComics.docs,
  );
  const pageTotal = useSelector(
    (state: RootState) => state.fileOps.recentComics.totalDocs,
  );
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 3,
    500: 1,
  };

  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Library</h1>

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {data.map(({ _id, rawFileDetails, sourcedMetadata }) => {
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
          })}
        </Masonry>
      </div>
    </section>
  );
};

export default LibraryGrid;
