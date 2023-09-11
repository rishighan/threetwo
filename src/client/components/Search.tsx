import React, { useCallback, ReactElement } from "react";
import { isNil, isEmpty } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { importToDB } from "../actions/fileops.actions";
import { useSelector, useDispatch } from "react-redux";
import { comicinfoAPICall } from "../actions/comicinfo.actions";
import { search } from "../services/api/SearchApi";
import { Form, Field } from "react-final-form";
import Card from "./shared/Carda";
import ellipsize from "ellipsize";
import { convert } from "html-to-text";
import dayjs from "dayjs";

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
            field_list:
              "id,name,deck,api_detail_url,image,description,volume,cover_date",
            resources: "issue",
          },
        }),
      );
    },
    [dispatch],
  );

  const addToLibrary = useCallback(
    (sourceName: string, comicData) =>
      dispatch(importToDB(sourceName, { comicvine: comicData })),
    [],
  );

  const comicVineSearchResults = useSelector(
    (state: RootState) => state.comicInfo.searchResults,
  );
  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };

  return (
    <>
      <section className="container">
        <div className="section search">
          <h1 className="title">Search</h1>

          <Form
            onSubmit={getCVSearchResults}
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
                          placeholder="Type an issue/volume name"
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
            <div className="columns is-multiline">
              {comicVineSearchResults.results.map((result) => {
                return (
                  <div
                    key={result.id}
                    className="comicvine-metadata column is-10 mb-3"
                  >
                    <div className="columns">
                      <div className="column is-one-quarter">
                        <Card
                          key={result.id}
                          orientation={"vertical"}
                          imageUrl={result.image.small_url}
                          title={result.name}
                          hasDetails={false}
                        ></Card>
                      </div>
                      <div className="column">
                        <div className="is-size-3">
                          {!isEmpty(result.name) ? (
                            result.name
                          ) : (
                            <span className="is-size-3">No Name</span>
                          )}
                        </div>
                        <div className="field is-grouped mt-1">
                          <div className="control">
                            <div className="tags has-addons">
                              <span className="tag is-light">Cover date</span>
                              <span className="tag is-info is-light">
                                {dayjs(result.cover_date).format("MMM D, YYYY")}
                              </span>
                            </div>
                          </div>

                          <div className="control">
                            <div className="tags has-addons">
                              <span className="tag is-warning">
                                {result.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <a href={result.api_detail_url}>
                          {result.api_detail_url}
                        </a>
                        <p>
                          {ellipsize(
                            convert(result.description, {
                              baseElements: {
                                selectors: ["p"],
                              },
                            }),
                            320,
                          )}
                        </p>
                        <button
                          className="button is-success is-light is-outlined mt-2"
                          onClick={() => addToLibrary("comicvine", result)}
                        >
                          <i className="fa-solid fa-plus mr-2"></i> Want 
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
