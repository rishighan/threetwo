import React, { useMemo, ReactElement } from "react";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";

import { useSelector } from "react-redux";

interface ISearchProps {}

export const Search = ({}: ISearchProps): ReactElement => {
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
