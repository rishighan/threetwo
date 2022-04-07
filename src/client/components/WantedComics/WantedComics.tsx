import React, { ReactElement, useEffect } from "react";
import { useDispatch } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";

export const WantedComics = (props): ReactElement => {
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
          type: "wanted",
        },
      ),
    );
  }, []);
  return <>Ads</>;
};

export default WantedComics;
