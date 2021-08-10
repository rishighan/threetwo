import React, { useMemo, useCallback, ReactElement } from "react";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";

import { useSelector, useDispatch } from "react-redux";
import { comicinfoAPICall } from "../actions/comicinfo.actions";

interface ISearchProps {}

export const Search = ({}: ISearchProps): ReactElement => {
  const dispatch = useDispatch();
  const getCVSearchResults = useCallback(() => {
    dispatch(
      comicinfoAPICall({
        callURIAction: "search",
        method: "GET",
        params: {
          api_key: "a5fa0663683df8145a85d694b5da4b87e1c92c69",
          format: "json",
          limit: "10",
          offset: "0",
          field_list: "id,name,deck,api_detail_url",
        },
      }),
    );
  }, [dispatch]);
  return (
    <>
      <section className="container">
        <div className="section search">
          <div className="columns">
            <div className="column is-half">
              <h1 className="title">Search</h1>
              <input
                className="main-search-bar input is-large"
                type="text"
                placeholder="Enter a title, ComicVine ID or a series name"
              ></input>
            </div>
          </div>
          <article className="message is-dark is-half">
            <div className="message-body">
              <p className="mb-2">
                <span className="tag is-medium is-info is-light">
                  Search the ComicVine database
                </span>
                Search and add issues, series and trade paperbacks to your
                library. Then, download them using the configured AirDC++ or
                torrent clients.
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
};

export default Search;
