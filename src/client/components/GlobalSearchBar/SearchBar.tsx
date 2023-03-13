import { debounce, isEmpty, map } from "lodash";
import React, { ReactElement, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../Carda";

import { searchIssue } from "../../actions/fileops.actions";
import MetadataPanel from "../shared/MetadataPanel";

interface ISearchBarProps {
  data: any;
}

export const SearchBar = (data: ISearchBarProps): ReactElement => {
  const dispatch = useDispatch();
  const searchResults = useSelector(
    (state: RootState) => state.fileOps.librarySearchResultsFormatted,
  );

  const performSearch = useCallback(
    debounce((e) => {
      dispatch(
        searchIssue(
          {
            query: {
              volumeName: e.target.value,
            },
          },
          {
            pagination: {
              size: 25,
              from: 0,
            },
            type: "volumeName",
            trigger: "globalSearchBar",
          },
        ),
      );
    }, 500),
    [data],
  );
  return (
    <>
      <div className="control has-icons-right">
        <input
          className="input mt-2"
          placeholder="Search Library"
          onChange={(e) => performSearch(e)}
        />

        <span className="icon is-right mt-2">
          <i className="fa-solid fa-magnifying-glass"></i>
        </span>
      </div>
      {!isEmpty(searchResults) ? (
        <div
          className="columns box is-multiline"
          style={{
            padding: 4,
            position: "absolute",
            width: 360,
            margin: "60px 0 0 350px",
          }}
        >
          {map(searchResults, (result, idx) => (
            <MetadataPanel
              data={result}
              key={idx}
              imageStyle={{ maxWidth: 70 }}
              titleStyle={{ fontSize: "0.8rem" }}
              tagsStyle={{ fontSize: "0.7rem" }}
              containerStyle={{
                width: "100vw",
                padding: 0,
                margin: "0 0 8px 0",
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
