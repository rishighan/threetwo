import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { useParams } from "react-router-dom";
import Card from "./Card";
import MatchResult from "./MatchResult";
import ComicVineSearchForm from "./ComicVineSearchForm";

import { css } from "@emotion/react";
import PuffLoader from "react-spinners/PuffLoader";
import { isEmpty, isUndefined, isNil } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { fetchComicVineMatches } from "../actions/fileops.actions";
import { getComicBookDetailById } from "../actions/comicinfo.actions";
import { Drawer, Divider } from "antd";
import dayjs from "dayjs";
const prettyBytes = require("pretty-bytes");
import "antd/dist/antd.css";

import { useDispatch, useSelector } from "react-redux";

type ComicDetailProps = {};
/**
 * Component for displaying the metadata for a comic in greater detail.
 *
 * @component
 * @example
 * return (
 *   <ComicDetail/>
 * )
 */

export const ComicDetail = ({}: ComicDetailProps): ReactElement => {
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);

  const comicVineSearchResults = useSelector(
    (state: RootState) => state.comicInfo.searchResults,
  );
  const comicVineSearchQueryObject = useSelector(
    (state: RootState) => state.comicInfo.searchQuery,
  );
  const comicVineAPICallProgress = useSelector(
    (state: RootState) => state.comicInfo.inProgress,
  );
  const comicBookDetailData = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getComicBookDetailById(comicObjectId));
  }, [page, dispatch]);

  const openDrawerWithCVMatches = useCallback(() => {
    setVisible(true);
    dispatch(fetchComicVineMatches(comicBookDetailData));
  }, [dispatch, comicBookDetailData]);

  const onClose = () => {
    setVisible(false);
  };

  const [active, setActive] = useState(0);
  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };
  const isComicBookMetadataAvailable =
    comicBookDetailData.sourcedMetadata &&
    !isUndefined(comicBookDetailData.sourcedMetadata.comicvine) &&
    !isEmpty(comicBookDetailData.sourcedMetadata);
  // Tab groups for ComicVine metadata
  const tabGroup = [
    {
      id: 0,
      name: "Volume Information",
      content: isComicBookMetadataAvailable ? (
        <>
          <div className="columns">
            <div className="column is-narrow">
              <figure className="card-image">
                <img
                  src={
                    comicBookDetailData.sourcedMetadata.comicvine
                      .volumeInformation.image.thumb_url
                  }
                />
              </figure>
            </div>
            <div className="column is-4">
              <dl>
                <dt>
                  Is a part of{" "}
                  <span className="has-text-info">
                    {
                      comicBookDetailData.sourcedMetadata.comicvine
                        .volumeInformation.name
                    }
                  </span>
                </dt>
                <dd>
                  Published by
                  <span className="has-text-weight-semibold">
                    {" "}
                    {
                      comicBookDetailData.sourcedMetadata.comicvine
                        .volumeInformation.publisher.name
                    }
                  </span>
                </dd>
                <dd>
                  Total issues in this volume:{" "}
                  {
                    comicBookDetailData.sourcedMetadata.comicvine
                      .volumeInformation.count_of_issues
                  }
                </dd>
              </dl>
            </div>
          </div>
          <div className="columns">
            <div
              className="column is-three-quarters"
              dangerouslySetInnerHTML={createDescriptionMarkup(
                comicBookDetailData.sourcedMetadata.comicvine.volumeInformation
                  .description,
              )}
            ></div>
          </div>
        </>
      ) : null,
    },
    {
      id: 1,
      name: "Other Metadata",
      content: <div>bastard</div>,
    },
  ];
  const MetadataTabGroup = () => {
    return (
      <>
        <div className="tabs">
          <ul>
            {tabGroup.map(({ id, name }) => (
              <li
                key={id}
                className={id === active ? "is-active" : ""}
                onClick={() => setActive(id)}
              >
                <a>{name}</a>
              </li>
            ))}
          </ul>
        </div>
        {tabGroup.map(({ id, content }) => {
          return active === id ? content : null;
        })}
      </>
    );
  };

  return (
    <section className="container">
      <div className="section">
        {!isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) && (
          <>
            <h1 className="title">{comicBookDetailData.rawFileDetails.name}</h1>
            <div className="columns">
              <div className="column is-narrow">
                <Card
                  comicBookCoversMetadata={comicBookDetailData.rawFileDetails}
                  hasTitle={false}
                  isHorizontal={false}
                />
              </div>
              <div className="column">
                <div className="content comic-detail">
                  <dl>
                    <dt>Raw File Details</dt>
                    <dd>{comicBookDetailData.rawFileDetails.containedIn}</dd>
                    <dd>
                      {prettyBytes(comicBookDetailData.rawFileDetails.fileSize)}
                    </dd>
                    <dd>{comicBookDetailData.rawFileDetails.path}</dd>
                    <dd>
                      <span className="tag is-primary">
                        {comicBookDetailData.rawFileDetails.extension}
                      </span>
                    </dd>
                  </dl>
                </div>
                {!isNil(comicBookDetailData.sourcedMetadata.comicvine) && (
                  <div className="content comic-detail">
                    <Divider />
                    <dl>
                      <dt>ComicVine Metadata</dt>
                      <dd className="is-size-7">
                        Last scraped on{" "}
                        {dayjs(comicBookDetailData.updatedAt).format(
                          "MMM D YYYY [at] h:mm a",
                        )}
                      </dd>
                      <dd>
                        <h6>
                          {comicBookDetailData.sourcedMetadata.comicvine.name}
                        </h6>
                      </dd>
                      <dd>
                        {comicBookDetailData.sourcedMetadata.comicvine.number}
                      </dd>
                      <dd>
                        <div className="field is-grouped is-grouped-multiline">
                          <div className="control">
                            <div className="tags has-addons">
                              <span className="tag is-light">Type</span>
                              <span className="tag is-warning">
                                {
                                  comicBookDetailData.sourcedMetadata.comicvine
                                    .resource_type
                                }
                              </span>
                            </div>
                          </div>
                          <div className="control">
                            <div className="tags has-addons">
                              <span className="tag is-light">
                                ComicVine Issue ID
                              </span>
                              <span className="tag is-success">
                                {
                                  comicBookDetailData.sourcedMetadata.comicvine
                                    .id
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </dd>
                    </dl>
                  </div>
                )}
                <button
                  className="button is-small"
                  onClick={openDrawerWithCVMatches}
                >
                  <span className="icon">
                    <i className="fas fa-magic"></i>
                  </span>
                  <span>Match on Comic Vine</span>
                </button>
              </div>
            </div>

            {isComicBookMetadataAvailable ? <MetadataTabGroup /> : null}

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
                    <ComicVineSearchForm />
                    <Divider />
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
              ) : (
                <div className="progress-indicator-container">
                  <div className="indicator">
                    <PuffLoader loading={comicVineAPICallProgress} />
                  </div>
                </div>
              )}

              <div className="search-results-container">
                {!isEmpty(comicVineSearchResults) && (
                  <MatchResult
                    matchData={comicVineSearchResults}
                    comicObjectId={comicObjectId}
                  />
                )}
              </div>
            </Drawer>
          </>
        )}
      </div>
    </section>
  );
};
