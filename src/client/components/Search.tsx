import React, { useMemo, useCallback, ReactElement } from "react";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { useTable } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { isNil, isUndefined, map, isEmpty } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { useSelector, useDispatch } from "react-redux";
import { comicinfoAPICall } from "../actions/comicinfo.actions";
import { search } from "../services/api/SearchApi";
import { Form, Field } from "react-final-form";

interface ISearchProps {}

export const Search = ({}: ISearchProps): ReactElement => {
  const formData = {
    search: "",
  };
  const dispatch = useDispatch();
  const getCVSearchResults = useCallback(
    (searchQuery) => {
      dispatch(
        comicinfoAPICall({
          callURIAction: "search",
          callMethod: "GET",
          callParams: {
            api_key: "a5fa0663683df8145a85d694b5da4b87e1c92c69",
            query: searchQuery.search,
            format: "json",
            limit: "10",
            offset: "0",
            field_list: "id,name,deck,api_detail_url,image,description",
            resources: "volume",
          },
        }),
      );
    },
    [dispatch],
  );

  const getDCPPSearchResults = useCallback((searchQuery) => {
    search(searchQuery);
  }, []);

  const comicVineSearchResults = useSelector(
    (state: RootState) => state.comicInfo.searchResults,
  );

  return (
    <>
      <section className="container">
        <div className="section search">
          <h1 className="title">Search</h1>

          <Form
            onSubmit={() =>
              getDCPPSearchResults({
                query: {
                  pattern: "wolverine",
                  // file_type: "compressed",
                  extensions: ["cbz", "cbr"],
                },
                hub_urls: [
                  "nmdcs://piter.feardc.net:411",
                  "dchub://dc.fly-server.ru",
                  "dchub://dc.elitedc.ru",
                  "dchub://dc.kcahdep.online",
                ],
                priority: 1,
              })
            }
            initialValues={{
              ...formData,
            }}
            render={({ handleSubmit, form, submitting, pristine, values }) => (
              <form onSubmit={handleSubmit} className="form columns search">
                <div className="column is-three-quarters search">
                  <Field name="search">
                    {({ input, meta }) => {
                      return (
                        <input
                          {...input}
                          className="input main-search-bar is-large"
                        />
                      );
                    }}
                  </Field>
                </div>
                <div className="column">
                  <button type="submit" className="button is-medium">
                    Search
                  </button>
                </div>
              </form>
            )}
          />
          {!isNil(comicVineSearchResults.results) &&
          !isEmpty(comicVineSearchResults.results) ? (
            <>
              {comicVineSearchResults.results.map(
                ({ id, name, description, api_detail_url, image }) => {
                  return (
                    <div key={id}>
                      {id} {name}
                      <p>{api_detail_url}</p>
                      <p>{description}</p>
                      <figure>
                        <img src={image.thumb_url} alt="name" />
                      </figure>
                    </div>
                  );
                },
              )}
            </>
          ) : (
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
          )}
        </div>
      </section>
    </>
  );
};

export default Search;
