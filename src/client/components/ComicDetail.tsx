import React, { useState, useEffect, useCallback, ReactElement } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Card from "./Carda";
import MatchResult from "./MatchResult";
import ComicVineSearchForm from "./ComicVineSearchForm";
import AcquisitionPanel from "./AcquisitionPanel";
import DownloadsPanel from "./DownloadsPanel";
import SlidingPane from "react-sliding-pane";
import Select, { components } from "react-select";

import "react-sliding-pane/dist/react-sliding-pane.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import { isEmpty, isUndefined, isNil } from "lodash";
import { RootState } from "threetwo-ui-typings";
import { fetchComicVineMatches } from "../actions/fileops.actions";
import {
  getComicBookDetailById,
  extractComicArchive,
} from "../actions/comicinfo.actions";
import { detectIssueTypes } from "../shared/utils/tradepaperback.utils";
import dayjs from "dayjs";
const prettyBytes = require("pretty-bytes");
import { DnD } from "./DnD";
import { useDispatch, useSelector } from "react-redux";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import Sticky from "react-stickynode";
import { IMPORT_SERVICE_HOST } from "../constants/endpoints";

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
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");

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
  const isComicBookExtractionInProgress = useSelector(
    (state: RootState) => state.fileOps.comicBookExtractionInProgress,
  );
  const extractedComicBookArchive = useSelector(
    (state: RootState) => state.fileOps.extractedComicBookArchive,
  );

  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getComicBookDetailById(comicObjectId));
  }, [page, dispatch]);

  const unpackComicArchive = useCallback(() => {
    dispatch(
      extractComicArchive(
        comicBookDetailData.rawFileDetails.containedIn +
          "/" +
          comicBookDetailData.rawFileDetails.name +
          comicBookDetailData.rawFileDetails.extension,
        {
          extractTarget: "book",
          targetExtractionFolder:
            "./userdata/expanded/" + comicBookDetailData.rawFileDetails.name,
          extractionMode: "all",
        },
      ),
    );
  }, [dispatch, comicBookDetailData]);

  // sliding panel init
  const contentForSlidingPanel = {
    CVMatches: {
      content: () => {
        return (
          <>
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
                  <Loader
                    type="MutatingDots"
                    color="#CCC"
                    secondaryColor="#999"
                    height={100}
                    width={100}
                    visible={comicVineAPICallProgress}
                  />
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
          </>
        );
      },
    },
    editComicArchive: {
      content: () => <></>,
    },
  };

  const openDrawerWithCVMatches = useCallback(() => {
    dispatch(fetchComicVineMatches(comicBookDetailData));
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  }, [dispatch, comicBookDetailData]);

  const [active, setActive] = useState(1);
  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };
  const isComicBookMetadataAvailable =
    comicBookDetailData.sourcedMetadata &&
    !isUndefined(comicBookDetailData.sourcedMetadata.comicvine) &&
    !isEmpty(comicBookDetailData.sourcedMetadata);

  // Tab content and header details
  const tabGroup = [
    {
      id: 1,
      name: "Volume Information",
      icon: <i className="fa-solid fa-layer-group"></i>,
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
                  Total issues in this volume:
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
      icon: <i className="fa-regular fa-file-archive"></i>,
      name: "Archive Operations",
      content: (
        <div key={2}>
          <button
            className={
              isComicBookExtractionInProgress
                ? "button is-loading is-warning"
                : "button is-warning"
            }
            onClick={unpackComicArchive}
          >
            <span className="icon is-small">
              <i className="fa-solid fa-box-open"></i>
            </span>
            <span>Unpack comic archive</span>
          </button>
          <div className="columns">
            <div className="mt-5">
              {!isEmpty(extractedComicBookArchive) ? (
                <DnD data={extractedComicBookArchive} />
              ) : null}
            </div>
            {!isEmpty(extractedComicBookArchive) ? (
              <div className="column mt-5">
                <Sticky enabled={true} top={70} bottomBoundary={3000}>
                  <div className="card">
                    <div className="card-content">
                      {extractedComicBookArchive.length} pages
                      <button className="button is-small is-light is-primary is-outlined">
                        <span className="icon is-small">
                          <i className="fa-solid fa-compress"></i>
                        </span>
                        <span>Convert to CBZ</span>
                      </button>
                    </div>
                  </div>
                </Sticky>
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      icon: <i className="fa-solid fa-floppy-disk"></i>,
      name: "Acquisition",
      content: (
        <AcquisitionPanel comicBookMetadata={comicBookDetailData} key={3} />
      ),
    },
    {
      id: 4,
      icon: null,
      name:
        !isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) ? (
          <span className="download-tab-name">Downloads</span>
        ) : (
          "Downloads"
        ),
      content: !isNil(comicBookDetailData) && !isEmpty(comicBookDetailData) && (
        <DownloadsPanel
          data={comicBookDetailData.acquisition.directconnect}
          comicObjectId={comicObjectId}
          key={4}
        />
      ),
    },
  ];
  // Tabs
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
                {/* Downloads tab and count badge */}
                <a>
                  {id === 4 &&
                  !isNil(comicBookDetailData) &&
                  !isEmpty(comicBookDetailData) ? (
                    <span className="download-icon-labels">
                      <i className="fa-solid fa-download"></i>
                      <span className="tag downloads-count">
                        {comicBookDetailData.acquisition.directconnect.length}
                      </span>
                    </span>
                  ) : (
                    <span className="icon is-small">{icon}</span>
                  )}
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
        <dd className="is-size-7">
          {props.data.containedIn +
            "/" +
            props.data.name +
            props.data.extension}
        </dd>
        <dd>
          <div className="field is-grouped">
            <div className="control">
              <div className="tags has-addons">
                <span className="tag">Size</span>
                <span className="tag is-info is-light">
                  {prettyBytes(props.data.fileSize)}
                </span>
              </div>
            </div>
            <div className="control">
              <div className="tags has-addons">
                <span className="tag">Extension</span>
                <span className="tag is-primary is-light">
                  {props.data.extension}
                </span>
              </div>
            </div>
          </div>
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
            {!isUndefined(
              detectIssueTypes(
                comicBookDetailData.sourcedMetadata.comicvine.volumeInformation
                  .description,
              ),
            ) ? (
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-light">Detected Type</span>
                  <span className="tag is-warning">
                    {
                      detectIssueTypes(
                        comicBookDetailData.sourcedMetadata.comicvine
                          .volumeInformation.description,
                      ).displayName
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div className="control">
                <div className="tags has-addons">
                  <span className="tag is-light">Type</span>
                  <span className="tag is-warning">
                    {props.data.resource_type}
                  </span>
                </div>
              </div>
            )}
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

  ComicVineDetails.propTypes = {
    updatedAt: PropTypes.string,
    data: PropTypes.shape({
      name: PropTypes.string,
      number: PropTypes.string,
      resource_type: PropTypes.string,
      id: PropTypes.number,
    }),
  };

  RawFileDetails.propTypes = {
    data: PropTypes.shape({
      containedIn: PropTypes.string,
      name: PropTypes.string,
      fileSize: PropTypes.number,
      path: PropTypes.string,
      extension: PropTypes.string,
      cover: PropTypes.shape({
        filePath: PropTypes.string,
      }),
    }),
  };

  // Determine which cover image to use:
  // 1. from the locally imported or
  // 2. from the CV-scraped version
  let imagePath = "";
  let comicBookTitle = "";
  if (!isNil(comicBookDetailData.rawFileDetails)) {
    const encodedFilePath = encodeURI(
      `${IMPORT_SERVICE_HOST}` +
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

  //  Actions menu options and handler
  const CVMatchLabel = (
    <span>
      <i className="fa-solid fa-wand-magic"></i> Match on ComicVine
    </span>
  );

  const editLabel = (
    <span>
      <i className="fa-regular fa-pen-to-square"></i> Edit Metadata
    </span>
  );
  const deleteLabel = (
    <span>
      <i className="fa-regular fa-trash-alt"></i> Delete Comic
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
                      <i className="fa-solid fa-list"></i> Actions
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
              title={"Comic Vine Search Matches"}
              width={"600px"}
            >
              {slidingPanelContentId !== "" &&
                contentForSlidingPanel[slidingPanelContentId].content()}
            </SlidingPane>
          </>
        )}
      </div>
    </section>
  );
};
