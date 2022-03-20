import { isEmpty } from "lodash";
import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import { Library } from "./Library";

const LibraryContainer = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      searchIssue(
        {
          query: {},
        },
        {
          pagination: {
            size: 25,
            from: 0,
          },
        },
      ),
    );
  }, []);

  const searchResults = useSelector(
    (state: RootState) => state.fileOps.librarySearchResults,
  );

  return !isEmpty(searchResults) ? (
    <Library data={{ searchResults }} />
  ) : (
    "No data found."
  );
};

export default LibraryContainer;
