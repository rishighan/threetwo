import React, { useMemo, ReactElement, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { isEmpty, isNil, isUndefined } from "lodash";
import MetadataPanel from "../shared/MetadataPanel";
import T2Table from "../shared/T2Table";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import ellipsize from "ellipsize";

export const Library = (): ReactElement => {
  const searchResults = useSelector(
    (state: RootState) => state.fileOps.libraryComics,
  );
  const searchError = useSelector(
    (state: RootState) => state.fileOps.librarySearchError,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: 15,
            from: 0,
          },
          type: "all",
          trigger: "libraryPage"
        },
      ),
    );
  }, []);

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
  const columns = React.useMemo(() => [
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
              <span className="tag mt-5">No ComicInfo.xml</span>
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
            "_source.sourcedMetadata.comicvine.volumeInformation",
          cell: info => {
            return (
              !isNil(info.getValue()) && (
                <h6 className="is-size-7 has-text-weight-bold">
                  {info.getValue().publisher.name}
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
  ], []);


  /**
   * Pagination control that fetches the next x (pageSize) items
   * based on the y (pageIndex) offset from the Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   *  
   **/
  const nextPage = useCallback((pageIndex: number, pageSize: number) => {
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
          trigger: "libraryPage",
        },
      ),
    );
  }, []);


  /**
   * Pagination control that fetches the previous x (pageSize) items
   * based on the y (pageIndex) offset from the Elasticsearch index
   * @param {number} pageIndex
   * @param {number} pageSize
   * @returns void
   **/
  const previousPage = useCallback((pageIndex: number, pageSize: number) => {
    let from = 0;
    if (pageIndex === 2) {
      from = (pageIndex - 1) * pageSize + 2 - 17;
    } else {
      from = (pageIndex - 1) * pageSize + 2 - 16;
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
          trigger: "libraryPage"
        },
      ),
    );
  }, []);

  // ImportStatus.propTypes = {
  //   value: PropTypes.bool.isRequired,
  // };

  return (
    <section className="container">
      <div className="section">
        <div className="header-area">
          <h1 className="title">Library</h1>
        </div>
        {!isUndefined(searchResults.hits) && (
          <div>
            <div className="library">
              <T2Table
                totalPages={searchResults.hits.total.value}
                columns={columns}
                sourceData={searchResults?.hits?.hits}
                rowClickHandler={navigateToComicDetail}
                paginationHandlers={{
                  nextPage,
                  previousPage,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Library;
