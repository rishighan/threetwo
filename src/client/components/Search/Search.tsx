import React, { useCallback, ReactElement, useState } from "react";
import { isNil, isEmpty } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { importToDB } from "../../actions/fileops.actions";
import { comicinfoAPICall } from "../../actions/comicinfo.actions";
import { search } from "../../services/api/SearchApi";
import { Form, Field } from "react-final-form";
import Card from "../shared/Carda";
import ellipsize from "ellipsize";
import { convert } from "html-to-text";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { COMICVINE_SERVICE_URI } from "../../constants/endpoints";
import axios from "axios";

interface ISearchProps {}

export const Search = ({}: ISearchProps): ReactElement => {
  const formData = {
    search: "",
  };
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const getCVSearchResults = (searchQuery) => {
    console.log(searchQuery);
    setSearchQuery(searchQuery.search);
    // queryClient.invalidateQueries({ queryKey: ["comicvineSearchResults"] });
  };

  const {
    data: comicVineSearchResults,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${COMICVINE_SERVICE_URI}/search`,
        method: "GET",
        params: {
          api_key: "a5fa0663683df8145a85d694b5da4b87e1c92c69",
          query: searchQuery,
          format: "json",
          limit: "10",
          offset: "0",
          field_list:
            "id,name,deck,api_detail_url,image,description,volume,cover_date",
          resources: "issue",
        },
      }),
    queryKey: ["comicvineSearchResults", searchQuery],
    enabled: !isNil(searchQuery),
  });
  console.log(comicVineSearchResults);
  const addToLibrary = useCallback(
    (sourceName: string, comicData) =>
      importToDB(sourceName, { comicvine: comicData }),
    [],
  );

  // const comicVineSearchResults = useSelector(
  //   (state: RootState) => state.comicInfo.searchResults,
  // );
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
          {!isNil(comicVineSearchResults?.data.results) &&
          !isEmpty(comicVineSearchResults?.data.results) ? (
            <div className="">
              {comicVineSearchResults.data.results.map((result) => {
                return isSuccess ? (
                  <div key={result.id} className="">
                    <div className="flex flex-row">
                      <div className="max-w-150 mr-5">
                        <Card
                          key={result.id}
                          orientation={"vertical-2"}
                          imageUrl={result.image.small_url}
                          title={result.name}
                          hasDetails={false}
                        ></Card>
                      </div>
                      <div className="column">
                        <div className="text-xl">
                          {!isEmpty(result.volume.name) ? (
                            result.volume.name
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
                                selectors: ["p", "div"],
                              },
                            }),
                            320,
                          )}
                        </p>
                        <div className="mt-2">
                          <button
                            className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-2 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                            onClick={() => addToLibrary("comicvine", result)}
                          >
                            <i className="icon-[solar--add-square-bold-duotone] w-6 h-6 mr-2"></i>{" "}
                            Mark as Wanted
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>Loading</div>
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
