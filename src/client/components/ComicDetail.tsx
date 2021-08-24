import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { useParams } from "react-router-dom";
import Card from "./Carda";
import MatchResult from "./MatchResult";
import ComicVineSearchForm from "./ComicVineSearchForm";
import AcquisitionPanel from "./AcquisitionPanel";
import DownloadsPanel from "./DownloadsPanel";

import { css } from "@emotion/react";
import PuffLoader from "react-spinners/PuffLoader";
import { isEmpty, isUndefined, isNil } from "lodash";
import { RootState } from "threetwo-ui-typings";
import { fetchComicVineMatches } from "../actions/fileops.actions";
import { getComicBookDetailById } from "../actions/comicinfo.actions";
import { Drawer, Divider } from "antd";
import dayjs from "dayjs";
const prettyBytes = require("pretty-bytes");
import "antd/dist/antd.css";

import { useDispatch, useSelector } from "react-redux";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";

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
  const [isActionDropdownCollapsed, collapseActionDropdown] = useState(false);

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

  const bundleMetadata = useSelector(
    (state: RootState) => state.comicInfo.downloadResult,
  );
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const dispatch = useDispatch();
  const toggleActionDropdown = () =>
    collapseActionDropdown(!isActionDropdownCollapsed);

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

  const [active, setActive] = useState(1);
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
      id: 1,
      name: "Volume Information",
      icon: <i className="fas fa-layer-group"></i>,
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
      id: 2,
      icon: <i className="fas fa-puzzle-piece"></i>,
      name: "Other Metadata",
      content: <div>bastard</div>,
    },
    {
      id: 3,
      icon: <i className="fas fa-download"></i>,
      name: "Acquisition",
      content: <AcquisitionPanel comicBookMetadata={comicBookDetailData} />,
    },
    {
      id: 4,
      icon: <i className="fas fa-cloud-download-alt"></i>,
      name: "Downloads",
      content: <DownloadsPanel data={comicBookDetailData} />,
    },
  ];
  const MetadataTabGroup = () => {
    return (
      <>
        <div className="tabs">
          <ul>
            {tabGroup.map(({ id, name, icon }) => (
              <li
                key={id}
                className={id === active ? "is-active" : ""}
                onClick={() => setActive(id)}
              >
                <a>
                  <span className="icon is-small">{icon}</span>
                  {name}
                </a>
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

  const RawFileDetails = (props) => (
    <div className="content comic-detail">
      <dl>
        <dt>Raw File Details</dt>
        <dd>{props.data.containedIn}</dd>
        <dd>{prettyBytes(props.data.fileSize)}</dd>
        <dd>{props.data.path}</dd>
        <dd>
          <span className="tag is-primary">{props.data.extension}</span>
        </dd>
      </dl>
    </div>
  );

  const ComicVineDetails = (props) => (
    <div className="content comic-detail">
      <dl>
        <dt>ComicVine Metadata</dt>
        <dd className="is-size-7">
          Last scraped on{" "}
          {dayjs(props.updatedAt).format("MMM D YYYY [at] h:mm a")}
        </dd>
        <dd>
          <h6>{props.data.name}</h6>
        </dd>
        <dd>{props.data.number}</dd>
        <dd>
          <div className="field is-grouped is-grouped-multiline">
            <div className="control">
              <div className="tags has-addons">
                <span className="tag is-light">Type</span>
                <span className="tag is-warning">
                  {props.data.resource_type}
                </span>
              </div>
            </div>
            <div className="control">
              <div className="tags has-addons">
                <span className="tag is-light">ComicVine Issue ID</span>
                <span className="tag is-success">{props.data.id}</span>
              </div>
            </div>
          </div>
        </dd>
      </dl>
    </div>
  );

  let imagePath = "";
  let comicBookTitle = "";
  if (!isNil(comicBookDetailData.rawFileDetails)) {
    const encodedFilePath = encodeURI(
      "http://localhost:3000" +
        removeLeadingPeriod(comicBookDetailData.rawFileDetails.path),
    );
    imagePath = escapePoundSymbol(encodedFilePath);
    comicBookTitle = comicBookDetailData.rawFileDetails.name;
  } else if (
    !isNil(comicBookDetailData.sourcedMetadata) &&
    !isNil(comicBookDetailData.sourcedMetadata.comicvine)
  ) {
    imagePath = comicBookDetailData.sourcedMetadata.comicvine.image.small_url;
    comicBookTitle = comicBookDetailData.sourcedMetadata.comicvine.name;
  }
  return (
    <section className="container">
      <div className="section">
        {!isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) && (
          <>
            <h1 className="title">{comicBookTitle}</h1>
            <div className="columns">
              <div className="column is-narrow">
                <Card
                  imageUrl={imagePath}
                  orientation={"vertical"}
                  hasDetails={false}
                />
              </div>
              {/* raw file details */}
              <div className="column">
                {!isNil(comicBookDetailData.rawFileDetails) && (
                  <>
                    <RawFileDetails data={comicBookDetailData.rawFileDetails} />
                    <Divider />
                  </>
                )}
                {/* comic vine scraped metadata */}
                {!isNil(comicBookDetailData.sourcedMetadata.comicvine) && (
                  <ComicVineDetails
                    data={comicBookDetailData.sourcedMetadata.comicvine}
                    updatedAt={comicBookDetailData.updatedAt}
                  />
                )}
                {/* action dropdown */}
                <div
                  className={
                    "dropdown " + (isActionDropdownCollapsed ? "is-active" : "")
                  }
                  onBlur={() => toggleActionDropdown()}
                  onFocus={() => toggleActionDropdown()}
                >
                  <div className="dropdown-trigger">
                    <button
                      className="button is-small"
                      aria-haspopup="true"
                      aria-controls="dropdown-menu2"
                      onClick={() => toggleActionDropdown()}
                    >
                      <span>
                        <i className="fas fa-sliders-h"></i> Actions
                      </span>

                      <span className="icon is-small">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  </div>
                  <div
                    className="dropdown-menu"
                    id="dropdown-menu2"
                    role="menu"
                  >
                    <div className="dropdown-content">
                      <div
                        className="dropdown-item"
                        onClick={openDrawerWithCVMatches}
                      >
                        <span className="icon">
                          <i className="fas fa-magic"></i>
                        </span>
                        <span>Match on ComicVine</span>
                      </div>
                      <hr className="dropdown-divider" />
                      <div className="dropdown-item">
                        <span className="icon">
                          <i className="fas fa-edit"></i>
                        </span>
                        <span>Edit Metdata</span>
                      </div>
                      <hr className="dropdown-divider" />
                      <div className="dropdown-item">
                        <span className="icon">
                          <i className="fas fa-trash"></i>
                        </span>
                        <span>Delete Comic</span>
                      </div>
                    </div>
                  </div>
                </div>
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
