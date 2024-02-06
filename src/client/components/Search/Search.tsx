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
import {
  COMICVINE_SERVICE_URI,
  LIBRARY_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import axios from "axios";

interface ISearchProps {}

export const Search = ({}: ISearchProps): ReactElement => {
  const formData = {
    search: "",
  };
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [comicVineMetadata, setComicVineMetadata] = useState({});
  const getCVSearchResults = (searchQuery) => {
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

  // add to library
  const { data: additionResult } = useQuery({
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/rawImportToDb`,
        method: "POST",
        data: {
          importType: "new",
          payload: {
            rawFileDetails: {
              name: "",
            },
            importStatus: {
              isImported: true,
              tagged: false,
              matchedResult: {
                score: "0",
              },
            },
            sourcedMetadata:
              { comicvine: comicVineMetadata?.comicData } || null,
            acquisition: { source: { wanted: true, name: "comicvine" } },
          },
        },
      }),
    queryKey: ["additionResult"],
    enabled: !isNil(comicVineMetadata.comicData),
  });

  const addToLibrary = (sourceName: string, comicData) =>
    setComicVineMetadata({ sourceName, comicData });

  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div>
      <section>
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Search
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Browse your comic book collection.
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-screen-sm px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <Form
            onSubmit={getCVSearchResults}
            initialValues={{
              ...formData,
            }}
            render={({ handleSubmit, form, submitting, pristine, values }) => (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-row w-full">
                  <div className="flex flex-row bg-slate-300 dark:bg-slate-500 rounded-l-lg p-2 min-w-full">
                    <div className="w-10 text-gray-400">
                      <i className="icon-[solar--magnifer-bold-duotone] h-7 w-7" />
                    </div>

                    <Field name="search">
                      {({ input, meta }) => {
                        return (
                          <input
                            {...input}
                            className="bg-slate-300 dark:bg-slate-500 outline-none text-lg text-gray-700 w-full"
                            placeholder="Type an issue/volume name"
                          />
                        );
                      }}
                    </Field>
                  </div>

                  <button
                    className="sm:mt-0 rounded-r-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                    type="submit"
                  >
                    Search
                  </button>
                </div>
              </form>
            )}
          />
        </div>
        {!isNil(comicVineSearchResults?.data.results) &&
        !isEmpty(comicVineSearchResults?.data.results) ? (
          <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            {comicVineSearchResults.data.results.map((result) => {
              return isSuccess ? (
                <div key={result.id} className="mb-5">
                  <div className="flex flex-row">
                    <div className="mr-5">
                      <Card
                        key={result.id}
                        orientation={"cover-only"}
                        imageUrl={result.image.small_url}
                        hasDetails={false}
                      />
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
                            <span className="tag is-warning">{result.id}</span>
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
          <div className="mx-auto mx-auto max-w-screen-md px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            <article
              role="alert"
              className="mt-4 rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
            >
              <div>
                <p> Search the ComicVine database</p>
                <p>
                  Note that you need an instance of AirDC++ already running to
                  use this form to connect to it.
                </p>
                <p>
                  Search and add issues, series and trade paperbacks to your
                  library. Then, download them using the configured AirDC++ or
                  torrent clients.
                </p>
              </div>
            </article>
          </div>
        )}
      </section>
    </div>
  );
};

export default Search;
