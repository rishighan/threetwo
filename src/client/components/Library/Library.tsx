import React, {
  useState,
  useEffect,
  useMemo,
  ReactElement,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import T2Table from "../shared/T2Table";
import { isEmpty, isNil, isUndefined } from "lodash";
import RawFileDetails from "./RawFileDetails";
import ComicVineDetails from "./ComicVineDetails";
import MetadataPanel from "../shared/MetadataPanel";
import SearchBar from "./SearchBar";
import { useDispatch } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import ellipsize from "ellipsize";
import { determineCoverFile } from "../../shared/utils/metadata.utils";

interface IComicBookLibraryProps {
  data: {
    searchResults: any;
  };
}

export const Library = (data: IComicBookLibraryProps): ReactElement => {
  const { searchResults } = data.data;

  // programatically navigate to comic detail
  const navigate = useNavigate();
  const navigateToComicDetail = (row) => {
    navigate(`/comic/details/${row.original._id}`);
  };

  const ComicInfoXML = (value) => {
    return value.data ? (
      <div className="comicvine-metadata">
        <dl>
          <span className="tags has-addons is-size-7">
            <span className="tag">Series</span>
            <span className="tag is-warning is-light">
              {ellipsize(value.data.series[0], 25)}
            </span>
          </span>
        </dl>
        <dl>
          <div className="field is-grouped is-grouped-multiline">
            <div className="control">
              <span className="tags has-addons is-size-7  mt-2">
                <span className="tag">Pages</span>
                <span className="tag is-info is-light has-text-weight-bold">
                  {value.data.pagecount[0]}
                </span>
              </span>
            </div>

            <div className="control">
              <span className="tags has-addons is-size-7 mt-2">
                <span className="tag">Issue</span>
                {!isNil(value.data.number) && (
                  <span className="tag has-text-weight-bold is-success is-light">
                    {parseInt(value.data.number[0], 10)}
                  </span>
                )}
              </span>
            </div>
          </div>
        </dl>
      </div>
    ) : null;
  };

  const WantedStatus = ({ value }) => {
    return !value ? <span className="tag is-info is-light">Wanted</span> : null;
  };

  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "File Details",
            id: "fileDetails",
            minWidth: 400,
            accessor: "_source",
            Cell: ({ value }) => {
              const {
                rawFileDetails,
                sourcedMetadata: { comicvine, locg },
              } = value;
              const { issueName, url } = determineCoverFile({
                comicvine,
                locg,
                rawFileDetails,
              });

              return (
                <MetadataPanel props={value}>
                  <div></div>
                  {/* <dl>
                  <dt>
                    <h6 className="name has-text-weight-medium mb-1">
                      {rawFileDetails.name}
                    </h6>
                  </dt>
                  <dd className="is-size-7">
                    Is a part of{" "}
                    <span className="has-text-weight-semibold">
                      {inferredMetadata.issue.name}
                    </span>
                  </dd>

                  <dd className="is-size-7 mt-2">
                    <div className="field is-grouped is-grouped-multiline">
                      <div className="control">
                        <span className="tags">
                          <span className="tag is-success is-light has-text-weight-semibold">
                            {rawFileDetails.extension}
                          </span>
                          <span className="tag is-success is-light">
                            {prettyBytes(rawFileDetails.fileSize)}
                          </span>
                        </span>
                      </div>
                      <div className="control">
                        {inferredMetadata.issue.number && (
                          <div className="tags has-addons">
                            <span className="tag is-light">Issue #</span>
                            <span className="tag is-warning">
                              {inferredMetadata.issue.number}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </dd>
                </dl> */}
                </MetadataPanel>
              );
            },
          },
          {
            Header: "ComicInfo.xml",
            accessor: "_source.sourcedMetadata.comicInfo",
            align: "center",
            minWidth: 250,
            Cell: ({ value }) =>
              !isEmpty(value) ? (
                <ComicInfoXML data={value} />
              ) : (
                <span className="tag">No ComicInfo.xml</span>
              ),
          },
        ],
      },
      {
        Header: "Additional Metadata",
        columns: [
          {
            Header: "Publisher",
            accessor:
              "_source.sourcedMetadata.comicvine.volumeInformation.publisher",
            Cell(props) {
              return (
                !isNil(props.cell.value) && (
                  <h6 className="is-size-7 has-text-weight-bold">
                    {props.cell.value.name}
                  </h6>
                )
              );
            },
          },
          {
            Header: "Something",
            accessor: "_source.acquisition.source.wanted",
            Cell: (props) => {
              return <WantedStatus value={props.cell.value.toString()} />;
            },
          },
        ],
      },
    ],
    [],
  );

  // ImportStatus.propTypes = {
  //   value: PropTypes.bool.isRequired,
  // };

  const dispatch = useDispatch();
  const goToNextPage = useCallback((pageIndex, pageSize) => {
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: pageSize,
            from: pageSize * pageIndex + 1,
          },
          type: "all",
        },
      ),
    );
  }, []);

  const goToPreviousPage = useCallback((pageIndex, pageSize) => {
    let from = 0;
    if (pageIndex === 2) {
      from = (pageIndex - 1) * pageSize + 2 - 27;
    } else {
      from = (pageIndex - 1) * pageSize + 2 - 26;
    }
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: pageSize,
            from,
          },
          type: "all",
        },
      ),
    );
  }, []);
  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Library</h1>
        {/* Search bar */}
        <SearchBar />
        {!isUndefined(searchResults) && (
          <div>
            <div className="library">
              <T2Table
                rowData={searchResults.hits.hits}
                totalPages={searchResults.hits.total.value}
                columns={columns}
                paginationHandlers={{
                  nextPage: goToNextPage,
                  previousPage: goToPreviousPage,
                }}
                rowClickHandler={navigateToComicDetail}
              />
              {/* pagination controls */}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Library;
