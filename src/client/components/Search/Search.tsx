import React, { ReactElement, useState } from "react";
import { isNil, isEmpty, isUndefined } from "lodash";
import { IExtractedComicBookCoverFile, RootState } from "threetwo-ui-typings";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import { Form, Field } from "react-final-form";
import Card from "../shared/Carda";
import ellipsize from "ellipsize";
import { convert } from "html-to-text";
import { useTranslation } from "react-i18next";
import "../../shared/utils/i18n.util";
import PopoverButton from "../shared/PopoverButton";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  COMICVINE_SERVICE_URI,
  LIBRARY_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import axios from "axios";

interface ISearchProps {}

export const Search = ({}: ISearchProps): ReactElement => {
  const queryClient = useQueryClient();
  const formData = {
    search: "",
  };
  const [comicVineMetadata, setComicVineMetadata] = useState({});
  const [selectedResource, setSelectedResource] = useState("volume");
  const { t } = useTranslation();
  const handleResourceChange = (value) => {
    setSelectedResource(value);
  };

  const {
    mutate,
    data: comicVineSearchResults,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (data: { search: string; resource: string }) => {
      const { search, resource } = data;
      return await axios({
        url: `${COMICVINE_SERVICE_URI}/search`,
        method: "GET",
        params: {
          api_key: "a5fa0663683df8145a85d694b5da4b87e1c92c69",
          query: search,
          format: "json",
          limit: "10",
          offset: "0",
          field_list:
            "id,name,deck,api_detail_url,image,description,volume,cover_date,start_year,count_of_issues,publisher,issue_number",
          resources: resource,
        },
      });
    },
  });

  // add to library
  const { data: additionResult, mutate: addToWantedList } = useMutation({
    mutationFn: async ({
      source,
      comicObject,
      markEntireVolumeWanted,
      resourceType,
    }) => {
      let volumeInformation = {};
      let issues = [];
      switch (resourceType) {
        case "issue":
          const { id, api_detail_url, image, cover_date, issue_number } =
            comicObject;
          // Add issue metadata
          issues.push({
            id,
            url: api_detail_url,
            image,
            coverDate: cover_date,
            issueNumber: issue_number,
          });
          console.log(issues);
          // Get volume metadata from CV
          const response = await axios({
            url: `${COMICVINE_SERVICE_URI}/getVolumes`,
            method: "POST",
            data: {
              volumeURI: comicObject.volume.api_detail_url,
              fieldList:
                "id,name,deck,api_detail_url,image,description,start_year,year,count_of_issues,publisher,first_issue,last_issue",
            },
          });
          // set volume metadata key
          volumeInformation = response.data?.results;
          break;

        case "volume":
          const {
            id: volumeId,
            api_detail_url: apiUrl,
            image: volumeImage,
            name,
            publisher,
          } = comicObject;
          volumeInformation = {
            id: volumeId,
            url: apiUrl,
            image: volumeImage,
            name,
            publisher,
          };
          break;

        default:
          console.log("Invalid resource type.");
          break;
      }
      // Add to wanted list
      return await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/rawImportToDb`,
        method: "POST",
        data: {
          importType: "new",
          payload: {
            importStatus: {
              isImported: false, // wanted, but not acquired yet.
              tagged: false,
              matchedResult: {
                score: "0",
              },
            },
            wanted: {
              source,
              markEntireVolumeWanted,
              issues,
              volume: volumeInformation,
            },
            sourcedMetadata: { comicvine: volumeInformation },
          },
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch wanted comics queries
      queryClient.invalidateQueries({ queryKey: ["wantedComics"] });
    },
  });

  const addToLibrary = (sourceName: string, comicData) =>
    setComicVineMetadata({ sourceName, comicData });

  const createDescriptionMarkup = (html) => {
    return { __html: html };
  };

  const onSubmit = async (values) => {
    const formData = { ...values, resource: selectedResource };
    try {
      mutate(formData);
    } catch (error) {
      // Handle error
    }
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
            onSubmit={onSubmit}
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
                {/* resource type selection: volume, issue etc. */}
                <div className="flex flex-row gap-3 mt-4">
                  <Field name="resource" type="radio" value="volume">
                    {({ input: volumesInput, meta }) => (
                      <div className="w-fit rounded-xl">
                        <div>
                          <input
                            {...volumesInput}
                            type="radio"
                            id="volume"
                            checked={selectedResource === "volume"}
                            onChange={() => handleResourceChange("volume")}
                            className="peer hidden"
                          />
                          <label
                            htmlFor="volume"
                            className="block cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-500 peer-checked:font-bold peer-checked:text-white"
                          >
                            Volumes
                          </label>
                        </div>
                      </div>
                    )}
                  </Field>

                  <Field name="resource" type="radio" value="issue">
                    {({ input: issuesInput, meta }) => (
                      <div className="w-fit rounded-xl">
                        <div>
                          <input
                            {...issuesInput}
                            type="radio"
                            id="issue"
                            checked={selectedResource === "issue"}
                            onChange={() => handleResourceChange("issue")}
                            className="peer hidden"
                          />
                          <label
                            htmlFor="issue"
                            className="block cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-500 peer-checked:font-bold peer-checked:text-white"
                          >
                            Issues
                          </label>
                        </div>
                      </div>
                    )}
                  </Field>
                </div>
              </form>
            )}
          />
        </div>
        {isPending && (
          <div className="max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            Loading results...
          </div>
        )}
        {!isEmpty(comicVineSearchResults?.data?.results) ? (
          <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            {comicVineSearchResults.data.results.map((result) => {
              return result.resource_type === "issue" ? (
                <div
                  key={result.id}
                  className="mb-5 dark:bg-slate-400 p-4 rounded-lg"
                >
                  <div className="flex flex-row">
                    <div className="mr-5 min-w-[80px] max-w-[13%]">
                      <Card
                        key={result.id}
                        orientation={"cover-only"}
                        imageUrl={result.image.small_url}
                        hasDetails={false}
                      />
                    </div>
                    <div className="w-3/4">
                      <div className="text-xl">
                        {!isEmpty(result.volume.name) ? (
                          result.volume.name
                        ) : (
                          <span className="is-size-3">No Name</span>
                        )}
                      </div>
                      {result.cover_date && (
                        <p>
                          <span className="tag is-light">Cover date</span>
                          {dayjs(result.cover_date).format("MMM D, YYYY")}
                        </p>
                      )}

                      <p className="tag is-warning">{result.id}</p>

                      <a href={result.api_detail_url}>
                        {result.api_detail_url}
                      </a>
                      <p className="text-sm">
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
                        <PopoverButton
                          content={`This will add ${result.volume.name} to your wanted list.`}
                          clickHandler={() =>
                            addToWantedList({
                              source: "comicvine",
                              comicObject: result,
                              markEntireVolumeWanted: false,
                              resourceType: "issue",
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                result.resource_type === "volume" && (
                  <div
                    key={result.id}
                    className="mb-5 dark:bg-slate-500 p-4 rounded-lg"
                  >
                    <div className="flex flex-row">
                      <div className="mr-5 min-w-[80px] max-w-[13%]">
                        <Card
                          key={result.id}
                          orientation={"cover-only"}
                          imageUrl={result.image.small_url}
                          hasDetails={false}
                        />
                      </div>
                      <div className="w-3/4">
                        <div className="text-xl">
                          {!isEmpty(result.name) ? (
                            result.name
                          ) : (
                            <span className="text-xl">No Name</span>
                          )}
                          {result.start_year && <> ({result.start_year})</>}
                        </div>

                        <div className="flex flex-row gap-2">
                          {/* issue count */}
                          {result.count_of_issues && (
                            <div className="my-2">
                              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                                <span className="pr-1 pt-1">
                                  <i className="icon-[solar--documents-minimalistic-bold-duotone] w-5 h-5"></i>
                                </span>

                                <span className="text-md text-slate-500 dark:text-slate-900">
                                  {t("issueWithCount", {
                                    count: result.count_of_issues,
                                  })}
                                </span>
                              </span>
                            </div>
                          )}
                          {/* type: TPB, one-shot, graphic novel etc. */}
                          {!isNil(result.description) &&
                            !isUndefined(result.description) && (
                              <>
                                {!isEmpty(
                                  detectIssueTypes(result.description),
                                ) && (
                                  <div className="my-2">
                                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                                      <span className="pr-1 pt-1">
                                        <i className="icon-[solar--book-2-line-duotone] w-5 h-5"></i>
                                      </span>

                                      <span className="text-md text-slate-500 dark:text-slate-900">
                                        {
                                          detectIssueTypes(result.description)
                                            .displayName
                                        }
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                        </div>

                        <span className="tag is-warning">{result.id}</span>
                        <p>
                          <a href={result.api_detail_url}>
                            {result.api_detail_url}
                          </a>
                        </p>

                        {/* description */}
                        <p className="text-sm">
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
                          <PopoverButton
                            content={`Adding this volume will add ${t(
                              "issueWithCount",
                              {
                                count: result.count_of_issues,
                              },
                            )} to your wanted list.`}
                            clickHandler={() =>
                              addToWantedList({
                                source: "comicvine",
                                comicObject: result,
                                markEntireVolumeWanted: true,
                                resourceType: "volume",
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
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
