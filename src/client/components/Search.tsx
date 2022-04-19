import React, { useMemo, useCallback, ReactElement } from "react";
import { isNil, isEmpty } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { importToDB } from "../actions/fileops.actions";
import { useSelector, useDispatch } from "react-redux";
import { comicinfoAPICall } from "../actions/comicinfo.actions";
import { search } from "../services/api/SearchApi";
import { Form, Field } from "react-final-form";
import Card from "./Carda";

interface ISearchProps { }

export const Search = ({ }: ISearchProps): ReactElement => {
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
            field_list: "id,name,deck,api_detail_url,image,description,volume",
            resources: "issue",
          },
        }),
      );
    },
    [dispatch],
  );

  const addToLibrary = useCallback(
    (comicData) => dispatch(importToDB(comicData)),
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
            <div>
              {comicVineSearchResults.results.map((result) => {
                return (
                  <div key={result.id} className="columns is-full">
                    <div className="column is-one-quarter">
                      <Card
                        key={result.id}
                        orientation={"vertical"}
                        imageUrl={result.image.small_url}
                        title={result.name}
                        hasDetails={false}
                      ></Card>
                    </div>
                    <div className="column is-half">
                      <div className="is-size-4">{result.name}</div>
                      <span className="tag is-warning">{result.id}</span>
                      <p>{result.api_detail_url}</p>
                      <p
                        dangerouslySetInnerHTML={createDescriptionMarkup(
                          result.description,
                        )}
                      ></p>
                      <button
                        className="button is-success is-light is-outlined"
                        onClick={() => addToLibrary(result)}
                      >
                        Add to Library
                      </button>
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
