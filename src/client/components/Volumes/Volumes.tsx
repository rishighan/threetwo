import React, { ReactElement, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import Card from "../Carda";
import SearchBar from "../Library/SearchBar";
import T2Table from "../shared/T2Table";
import ellipsize from "ellipsize";
import { isUndefined } from "lodash";
import { convert } from "html-to-text";

export const Volumes = (props): ReactElement => {
  const volumes = useSelector(
    (state: RootState) => state.fileOps.librarySearchResults,
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
            size: 25,
            from: 0,
          },
          type: "volumes",
        },
      ),
    );
  }, []);
  console.log(volumes);
  return <div>as</div>;
};

export default Volumes;
