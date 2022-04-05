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
import SearchBar from "./SearchBar";
import { useDispatch } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import ellipsize from "ellipsize";

interface IComicBookLibraryProps {
  data: {
    searchResults: any;
  };
}

export const Library = (data: IComicBookLibraryProps): ReactElement => {
  const { searchResults } = data.data;

  console.log(searchResults);
  // programatically navigate to comic detail
  const navigate = useNavigate();
  const navigateToComicDetail = (row) => {
    navigate(`/comic/details/${row.original._id}`);
  };

  const ImportStatus = ({ value }) => {
    return value ? (
      <div className="comicvine-metadata">
        <dl>
          <span className="tags has-addons is-size-7">
            <span className="tag">Series</span>
            <span className="tag is-warning is-light">
              {ellipsize(value.series[0], 25)}
            </span>
          </span>
        </dl>
        <dl>
          <div className="field is-grouped is-grouped-multiline">
            <div className="control">
              <span className="tags has-addons is-size-7  mt-2">
                <span className="tag">Pages</span>
                <span className="tag is-info is-light has-text-weight-bold">
                  {value.pagecount[0]}
                </span>
              </span>
            </div>

            <div className="control">
              <span className="tags has-addons is-size-7 mt-2">
                <span className="tag">Issue</span>
                {!isNil(value.number) && (
                  <span className="tag has-text-weight-bold is-success is-light">
                    {parseInt(value.number[0], 10)}
                  </span>
                )}
              </span>
            </div>
          </div>
        </dl>
      </div>
    ) : (
      <span className="is-size-7">No ComicInfo.xml</span>
    );
  };

  const WantedStatus = ({ value }) => {
    console.log(value);
    return !value ? <span className="tag is-info is-light">Wanted</span> : null;
  };

  console.log(searchResults);
  // return null;
  const columns = useMemo(
    () => [
      {
        Header: "Comic Metadata",
        columns: [
          {
            Header: "File Details",
            id: "fileDetails",
            minWidth: 450,
            accessor: (row) =>
              !isEmpty(row._source.rawFileDetails)
                ? {
                    rawFileDetails: row._source.rawFileDetails,
                    inferredMetadata: row._source.inferredMetadata,
                  }
                : row._source.sourcedMetadata,
            Cell: ({ value }) => {
              // If no CV info available, use raw file metadata
              if (!isNil(value.rawFileDetails.cover)) {
                return <RawFileDetails data={value} />;
              }
              // If CV metadata available, show it
              if (!isNil(value.comicvine)) {
                return <ComicVineDetails data={value} />;
              }
              return <div>null</div>;
            },
          },
          {
            Header: "Import Status",
            accessor: "_source.sourcedMetadata.comicInfo",
            minWidth: 300,
            align: "right",
            Cell: ImportStatus,
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
                !isNil(props.cell.value) && <h6>{props.cell.value.name}</h6>
              );
            },
          },
          {
            Header: "Something",
            accessor: "_source.acquisition.wanted",
            Cell: (props) => {
              return <WantedStatus value={props.cell.value.toString()} />;
            },
          },
        ],
      },
    ],
    [],
  );

  ImportStatus.propTypes = {
    value: PropTypes.bool.isRequired,
  };

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
