import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { useParams } from "react-router-dom";
import Card from "./Carda";
import MatchResult from "./MatchResult";
import ComicVineSearchForm from "./ComicVineSearchForm";
import AcquisitionPanel from "./AcquisitionPanel";
import DownloadsPanel from "./DownloadsPanel";
import SlidingPane from "react-sliding-pane";
import Select, { components } from "react-select";

import { css } from "@emotion/react";
import "react-sliding-pane/dist/react-sliding-pane.css";
import PuffLoader from "react-spinners/PuffLoader";
import { isEmpty, isUndefined, isNil } from "lodash";
import { RootState } from "threetwo-ui-typings";
import { fetchComicVineMatches } from "../actions/fileops.actions";
import { getComicBookDetailById } from "../actions/comicinfo.actions";
import dayjs from "dayjs";
const prettyBytes = require("pretty-bytes");

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
        <div key={1}>
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
        </div>
      ) : null,
    },
    {
      id: 2,
      icon: <i className="fas fa-puzzle-piece"></i>,
      name: "Other Metadata",
      content: <div key={2}>bastard</div>,
    },
    {
      id: 3,
      icon: <i className="fas fa-download"></i>,
      name: "Acquisition",
      content: (
        <AcquisitionPanel comicBookMetadata={comicBookDetailData} key={3} />
      ),
    },
    {
      id: 4,
      icon: <i className="fas fa-cloud-download-alt"></i>,
      name: "Downloads",
      content: <DownloadsPanel data={comicBookDetailData} key={4} />,
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

  //  actions menu options and handler
  const CVMatchLabel = (
    <span>
      <i className="fas fa-magic"></i> Match on ComicVine
    </span>
  );

  const editLabel = (
    <span>
      <i className="fas fa-pencil-alt"></i> Edit Metadata
    </span>
  );
  const deleteLabel = (
    <span>
      <i className="fas fa-trash-alt"></i> Delete Comic
    </span>
  );
  const Placeholder = (props) => {
    return <components.Placeholder {...props} />;
  };
  const actionOptions = [
    { value: "match-on-comic-vine", label: CVMatchLabel },
    { value: "edit-metdata", label: editLabel },
    { value: "delete-comic", label: deleteLabel },
  ];

  const handleActionSelection = (action) => {
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
        break;
      default:
        console.log("No valid action selected.");
        break;
    }
  };
  return (
    <section className="container">
      <div className="section">
        {!isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) && (
          <>
            <h1 className="title">{comicBookTitle}</h1>
            <div className="columns is-multiline">
              <div className="column is-narrow">
                <Card
                  imageUrl={imagePath}
                  orientation={"vertical"}
                  hasDetails={false}
                />
              </div>
              {/* raw file details */}
              <div className="column is-three-fifths">
                {!isNil(comicBookDetailData.rawFileDetails) && (
                  <>
                    <RawFileDetails data={comicBookDetailData.rawFileDetails} />
                  </>
                )}
                {/* comic vine scraped metadata */}
                {!isNil(comicBookDetailData.sourcedMetadata.comicvine) && (
                  <ComicVineDetails
                    data={comicBookDetailData.sourcedMetadata.comicvine}
                    updatedAt={comicBookDetailData.updatedAt}
                  />
                )}
              </div>
              {/* action dropdown */}
              <div className="column is-one-fifth is-narrow is-size-7">
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  components={{ Placeholder }}
                  placeholder={
                    <span>
                      <i className="fas fa-list"></i> Actions
                    </span>
                  }
                  name="actions"
                  isSearchable={false}
                  options={actionOptions}
                  onChange={handleActionSelection}
                />
              </div>
            </div>

            {isComicBookMetadataAvailable ? <MetadataTabGroup /> : null}

            <SlidingPane
              isOpen={visible}
              onRequestClose={() => setVisible(false)}
              width={"600px"}
            >
              {!isEmpty(comicVineSearchQueryObject) &&
              !isUndefined(comicVineSearchQueryObject) ? (
                <div className="card search-criteria-card">
                  <div className="card-content">
                    <ComicVineSearchForm />
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
            </SlidingPane>
          </>
        )}
      </div>
    </section>
  );
};
