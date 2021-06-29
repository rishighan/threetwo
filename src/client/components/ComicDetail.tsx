import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import MatchResult from "./MatchResult";
import { isEmpty, isUndefined } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { fetchComicVineMatches } from "../actions/fileops.actions";
import { Drawer } from "antd";
import "antd/dist/antd.css";

import { useDispatch, useSelector } from "react-redux";

type ComicDetailProps = {};

export const ComicDetail = ({}: ComicDetailProps): ReactElement => {
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [comicDetail, setComicDetail] = useState<{
    rawFileDetails: IExtractedComicBookCoverFile;
  }>();

  const comicVineSearchResults = useSelector(
    (state: RootState) => state.comicInfo.searchResults,
  );
  const comicVineSearchQueryObject = useSelector(
    (state: RootState) => state.comicInfo.searchQuery,
  );
  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  useEffect(() => {
    axios
      .request({
        url: `http://localhost:3000/api/import/getComicBookById`,

        method: "POST",
        data: {
          id: comicObjectId,
        },
      })
      .then((response) => {
        setComicDetail(response.data);
      })
      .catch((error) => console.log(error));
  }, [page]);

  const dispatch = useDispatch();

  const openDrawerWithCVMatches = useCallback(() => {
    setVisible(true);
    dispatch(fetchComicVineMatches(comicDetail));
  }, [dispatch, comicDetail]);

  const onClose = () => {
    setVisible(false);
  };

  return (
    <section className="container">
      {!isEmpty(comicDetail) && !isUndefined(comicDetail) && (
        <>
          <h1 className="title">{comicDetail.rawFileDetails.name}</h1>
          <div className="columns">
            <div className="column is-narrow">
              <Card comicBookCoversMetadata={comicDetail.rawFileDetails} />
            </div>
            <div className="column">
              <button className="button" onClick={openDrawerWithCVMatches}>
                <span className="icon">
                  <i className="fas fa-magic"></i>
                </span>
                <span>Match on Comic Vine</span>
              </button>
            </div>
          </div>

          <Drawer
            title="ComicVine Search Results"
            placement="right"
            width={640}
            closable={false}
            onClose={onClose}
            visible={visible}
            className="comic-vine-match-drawer"
          >
            {!isEmpty(comicVineSearchQueryObject) &&
            !isUndefined(comicVineSearchQueryObject) ? (
              <div className="card search-criteria-card">
                <div className="card-content">
                  <p className="is-size-6">Searching against:</p>
                  <div className="field is-grouped is-grouped-multiline">
                    <div className="control">
                      <div className="tags has-addons">
                        <span className="tag">Title</span>
                        <span className="tag is-info">
                          {
                            comicVineSearchQueryObject.issue.searchParams
                              .searchTerms.name
                          }
                        </span>
                      </div>
                    </div>
                    <div className="control">
                      <div className="tags has-addons">
                        <span className="tag">Number</span>
                        <span className="tag is-info">
                          {
                            comicVineSearchQueryObject.issue.searchParams
                              .searchTerms.number
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="search-results-container">
              {!isEmpty(comicVineSearchResults) && (
                <MatchResult matchData={comicVineSearchResults} />
              )}
            </div>
          </Drawer>
        </>
      )}
    </section>
  );
};
