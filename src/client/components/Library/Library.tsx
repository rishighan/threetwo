import React, { useMemo, ReactElement, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import T2Table from "../shared/T2Table";
import { isEmpty, isNil, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";
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

  const columns =  [
      {
        header: "Comic Metadata",
        footer: 1,
        columns: [
          {
            header: "File Details",
            id: "fileDetails",
            minWidth: 400,
            accessorKey: "_source",
            cell: info => {
              return <MetadataPanel data={info.getValue()} />;
            },
          },
          {
            header: "ComicInfo.xml",
            accessorKey: "_source.sourcedMetadata.comicInfo",
            align: "center",
            minWidth: 250,
            cell: info =>
              !isEmpty(info.getValue()) ? (
                <ComicInfoXML data={info.getValue()} />
              ) : (
                <span className="tag">No ComicInfo.xml</span>
              ),
          },
        ],
      },
      {
        header: "Additional Metadata",
        columns: [
          {
            header: "Publisher",
            accessorKey:
              "_source.sourcedMetadata.comicvine.volumeInformation.publisher",
            cell: info => {
              return (
                !isNil(info.getValue()) && (
                  <h6 className="is-size-7 has-text-weight-bold">
                    {info.getValue().rawFileDetails.name}
                  </h6>
                )
              );
            },
          },
          {
            header: "Something",
            accessorKey: "_source.acquisition.source.wanted",
            cell: info => {
              !isUndefined(info.getValue()) ?
              <WantedStatus value={info.getValue().toString()} /> : "Nothing";
            },
          },
        ],
      }
    ]

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
