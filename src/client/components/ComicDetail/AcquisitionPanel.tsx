import React, { useCallback, ReactElement, useEffect, useState } from "react";
import { getBundlesForComic, sleep } from "../../actions/airdcpp.actions";
import { SearchQuery, PriorityEnum, SearchResponse } from "threetwo-ui-typings";
import { RootState, SearchInstance } from "threetwo-ui-typings";
import ellipsize from "ellipsize";
import { Form, Field } from "react-final-form";
import { difference } from "../../shared/utils/object.utils";
import { isEmpty, isNil, map } from "lodash";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface IAcquisitionPanelProps {
  query: any;
  comicObjectId: any;
  comicObject: any;
  settings: any;
}

export const AcquisitionPanel = (
  props: IAcquisitionPanelProps,
): ReactElement => {
  const {
    airDCPPSocketInstance,
    airDCPPClientConfiguration,
    airDCPPSessionInformation,
    airDCPPDownloadTick,
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketInstance: state.airDCPPSocketInstance,
      airDCPPClientConfiguration: state.airDCPPClientConfiguration,
      airDCPPSessionInformation: state.airDCPPSessionInformation,
      airDCPPDownloadTick: state.airDCPPDownloadTick,
    })),
  );

  interface SearchData {
    query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
    hub_urls: string[] | undefined | null;
    priority: PriorityEnum;
  }

  /**
   * Get the hubs list from an AirDCPP Socket
   */
  const { data: hubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => await airDCPPSocketInstance.get(`hubs`),
  });
  const { comicObjectId } = props;
  const issueName = props.query.issue.name || "";
  const sanitizedIssueName = issueName.replace(/[^a-zA-Z0-9 ]/g, " ");

  const [dcppQuery, setDcppQuery] = useState({});
  const [airDCPPSearchResults, setAirDCPPSearchResults] = useState([]);
  const [airDCPPSearchStatus, setAirDCPPSearchStatus] = useState(false);
  const [airDCPPSearchInstance, setAirDCPPSearchInstance] = useState({});
  const [airDCPPSearchInfo, setAirDCPPSearchInfo] = useState({});
  const queryClient = useQueryClient();

  // Construct a AirDC++ query based on metadata inferred, upon component mount
  // Pre-populate the search input with the search string, so that
  // All the user has to do is hit "Search AirDC++"
  useEffect(() => {
    // AirDC++ search query
    const dcppSearchQuery = {
      query: {
        pattern: `${sanitizedIssueName.replace(/#/g, "")}`,
        extensions: ["cbz", "cbr", "cb7"],
      },
      hub_urls: map(hubs, (item) => item.value),
      priority: 5,
    };
    setDcppQuery(dcppSearchQuery);
  }, []);

  /**
   * Method to perform a search via an AirDC++ websocket
   * @param {SearchData} data - a SearchData query
   * @param {any} ADCPPSocket - an intialized AirDC++ socket instance
   */
  const search = async (data: SearchData, ADCPPSocket: any) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket();
      }
      const instance: SearchInstance = await ADCPPSocket.post("search");
      setAirDCPPSearchStatus(true);

      // We want to get notified about every new result in order to make the user experience better
      await ADCPPSocket.addListener(
        `search`,
        "search_result_added",
        async (groupedResult) => {
          // ...add the received result in the UI
          // (it's probably a good idea to have some kind of throttling for the UI updates as there can be thousands of results)
          setAirDCPPSearchResults((state) => [...state, groupedResult]);
        },
        instance.id,
      );

      // We also want to update the existing items in our list when new hits arrive for the previously listed files/directories
      await ADCPPSocket.addListener(
        `search`,
        "search_result_updated",
        async (groupedResult) => {
          // ...update properties of the existing result in the UI
          const bundleToUpdateIndex = airDCPPSearchResults?.findIndex(
            (bundle) => bundle.result.id === groupedResult.result.id,
          );
          const updatedState = [...airDCPPSearchResults];
          if (
            !isNil(difference(updatedState[bundleToUpdateIndex], groupedResult))
          ) {
            updatedState[bundleToUpdateIndex] = groupedResult;
          }
          setAirDCPPSearchResults((state) => [...state, ...updatedState]);
        },
        instance.id,
      );

      // We need to show something to the user in case the search won't yield any results so that he won't be waiting forever)
      // Wait for 5 seconds for any results to arrive after the searches were sent to the hubs
      await ADCPPSocket.addListener(
        `search`,
        "search_hub_searches_sent",
        async (searchInfo) => {
          await sleep(5000);

          // Check the number of received results (in real use cases we should know that even without calling the API)
          const currentInstance = await ADCPPSocket.get(
            `search/${instance.id}`,
          );
          setAirDCPPSearchInstance(currentInstance);
          setAirDCPPSearchInfo(searchInfo);
          console.log("Asdas", airDCPPSearchInfo);
          if (currentInstance.result_count === 0) {
            // ...nothing was received, show an informative message to the user
            console.log("No more search results.");
          }

          // The search can now be considered to be "complete"
          // If there's an "in progress" indicator in the UI, that could also be disabled here
          setAirDCPPSearchInstance(instance);
          setAirDCPPSearchStatus(false);
        },
        instance.id,
      );
      // Finally, perform the actual search
      await ADCPPSocket.post(`search/${instance.id}/hub_search`, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  /**
   * Method to download a bundle associated with a search result from AirDC++
   * @param {Number} searchInstanceId - description
   * @param {String} resultId - description
   * @param {String} comicObjectId - description
   * @param {String} name - description
   * @param {Number} size - description
   * @param {any} type - description
   * @param {any} ADCPPSocket - description
   * @returns {void}  - description
   */
  const download = async (
    searchInstanceId: Number,
    resultId: String,
    comicObjectId: String,
    name: String,
    size: Number,
    type: any,
    ADCPPSocket: any,
  ): void => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket.connect();
      }
      let bundleDBImportResult = {};
      const downloadResult = await ADCPPSocket.post(
        `search/${searchInstanceId}/results/${resultId}/download`,
      );

      if (!isNil(downloadResult)) {
        bundleDBImportResult = await axios({
          method: "POST",
          url: `http://localhost:3000/api/library/applyAirDCPPDownloadMetadata`,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          data: {
            bundleId: downloadResult.bundle_info.id,
            comicObjectId,
            name,
            size,
            type,
          },
        });
        console.log(bundleDBImportResult?.data);
        // queryClient.invalidateQueries({ queryKey: ["bundles"] });

        //         dispatch({
        //           type: AIRDCPP_RESULT_DOWNLOAD_INITIATED,
        //           downloadResult,
        //           bundleDBImportResult,
        //         });
        //
        //         dispatch({
        //           type: IMS_COMIC_BOOK_DB_OBJECT_FETCHED,
        //           comicBookDetail: bundleDBImportResult.data,
        //           IMS_inProgress: false,
        //         });
      }
    } catch (error) {
      throw error;
    }
  };
  const getDCPPSearchResults = async (searchQuery) => {
    const manualQuery = {
      query: {
        pattern: `${searchQuery.issueName}`,
        extensions: ["cbz", "cbr", "cb7"],
      },
      hub_urls: map(hubs, (hub) => hub.hub_url),
      priority: 5,
    };

    search(manualQuery, airDCPPSocketInstance);
  };

  // download via AirDC++
  const downloadDCPPResult = useCallback(
    (searchInstanceId, resultId, name, size, type) => {
      // dispatch(
      //   downloadAirDCPPItem(
      //     searchInstanceId,
      //     resultId,
      //     props.comicObjectId,
      //     name,
      //     size,
      //     type,
      //     airDCPPConfiguration.airDCPPState.socket,
      //     {
      //       username: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.username}`,
      //       password: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.password}`,
      //     },
      //   ),
      // );
      // this is to update the download count badge on the downloads tab
      // dispatch(
      //   getBundlesForComic(
      //     props.comicObjectId,
      //     airDCPPConfiguration.airDCPPState.socket,
      //     {
      //       username: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.username}`,
      //       password: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.password}`,
      //     },
      //   ),
      // );
    },
    [],
  );
  return (
    <>
      <div className="mt-5">
        {!isEmpty(airDCPPSocketInstance) ? (
          <Form
            onSubmit={getDCPPSearchResults}
            initialValues={{
              issueName,
            }}
            render={({ handleSubmit, form, submitting, pristine, values }) => (
              <form onSubmit={handleSubmit}>
                <Field name="issueName">
                  {({ input, meta }) => {
                    return (
                      <div className="max-w-fit">
                        <div className="flex flex-row bg-slate-300 dark:bg-slate-400 rounded-l-lg">
                          <div className="w-10 pl-2 pt-1 text-gray-400 dark:text-gray-200">
                            <i className="icon-[solar--magnifer-bold-duotone] h-7 w-7" />
                          </div>
                          <input
                            {...input}
                            className="dark:bg-slate-400 bg-slate-300 py-2 px-2 rounded-l-md border-gray-300 h-10 min-w-full dark:text-slate-800 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                            placeholder="Type an issue/volume name"
                          />

                          <button
                            className="sm:mt-0 min-w-fit rounded-r-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                            type="submit"
                          >
                            <div className="flex flex-row">
                              Search DC++
                              <div className="h-5 w-5 ml-2">
                                <img
                                  src="/src/client/assets/img/airdcpp_logo.svg"
                                  className="h-5 w-5"
                                />
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  }}
                </Field>
              </form>
            )}
          />
        ) : (
          <div className="column is-three-fifths">
            <article className="message is-info">
              <div className="message-body is-size-6 is-family-secondary">
                AirDC++ is not configured. Please configure it in{" "}
                <code>Settings &gt; AirDC++ &gt; Connection</code>.
              </div>
            </article>
          </div>
        )}
      </div>

      {/* AirDC++ search instance details */}
      {!isNil(airDCPPSearchInstance) &&
        !isEmpty(airDCPPSearchInfo) &&
        !isNil(hubs) && (
          <div className="flex flex-row gap-3 my-5 font-hasklig">
            <div className="block max-w-sm h-fit p-6 text-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-slate-400 dark:border-gray-700">
              <dl>
                <dt>
                  <div className="mb-1">
                    {hubs.map((value, idx) => (
                      <span className="tag is-warning" key={idx}>
                        {value.identity.name}
                      </span>
                    ))}
                  </div>
                </dt>

                <dt>
                  Query:
                  <span className="has-text-weight-semibold">
                    {airDCPPSearchInfo.query.pattern}
                  </span>
                </dt>
                <dd>
                  Extensions:
                  <span className="has-text-weight-semibold">
                    {airDCPPSearchInfo.query.extensions.join(", ")}
                  </span>
                </dd>
                <dd>
                  File type:
                  <span className="has-text-weight-semibold">
                    {airDCPPSearchInfo.query.file_type}
                  </span>
                </dd>
              </dl>
            </div>
            <div className="block max-w-sm p-6 h-fit text-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-slate-400 dark:border-gray-700">
              <dl>
                <dt>Search Instance: {airDCPPSearchInstance.id}</dt>
                <dt>Owned by {airDCPPSearchInstance.owner}</dt>
                <dd>Expires in: {airDCPPSearchInstance.expires_in}</dd>
              </dl>
            </div>
          </div>
        )}

      {/* AirDC++ results */}
      <div className="columns">
        {!isNil(airDCPPSearchResults) && !isEmpty(airDCPPSearchResults) ? (
          <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200 dark:border-gray-500">
            <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-500 text-md">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 dark:text-slate-200">
                    Name
                  </th>
                  <th className="whitespace-nowrap py-2 font-medium text-gray-900 dark:text-slate-200">
                    Type
                  </th>
                  <th className="whitespace-nowrap py-2 font-medium text-gray-900 dark:text-slate-200">
                    Slots
                  </th>
                  <th className="whitespace-nowrap py-2 font-medium text-gray-900 dark:text-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-500">
                {map(airDCPPSearchResults, ({ result }, idx) => {
                  return (
                    <tr
                      key={idx}
                      className={
                        !isNil(result.dupe)
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "w-fit text-sm"
                      }
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-gray-700 dark:text-slate-300">
                        <p className="mb-2">
                          {result.type.id === "directory" ? (
                            <i className="fas fa-folder"></i>
                          ) : null}
                          {ellipsize(result.name, 70)}
                        </p>

                        <dl>
                          <dd>
                            <div className="inline-flex flex-row gap-2">
                              {!isNil(result.dupe) ? (
                                <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                                  <span className="pr-1 pt-1">
                                    <i className="icon-[solar--copy-bold-duotone] w-5 h-5"></i>
                                  </span>

                                  <span className="text-md text-slate-500 dark:text-slate-900">
                                    Dupe
                                  </span>
                                </span>
                              ) : null}

                              {/* Nicks */}
                              <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                                <span className="pr-1 pt-1">
                                  <i className="icon-[solar--user-rounded-bold-duotone] w-5 h-5"></i>
                                </span>

                                <span className="text-md text-slate-500 dark:text-slate-900">
                                  {result.users.user.nicks}
                                </span>
                              </span>
                              {/* Flags */}
                              {result.users.user.flags.map((flag, idx) => (
                                <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                                  <span className="pr-1 pt-1">
                                    <i className="icon-[solar--tag-horizontal-bold-duotone] w-5 h-5"></i>
                                  </span>

                                  <span className="text-md text-slate-500 dark:text-slate-900">
                                    {flag}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </dd>
                        </dl>
                      </td>
                      <td>
                        {/* Extension */}
                        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          <span className="pr-1 pt-1">
                            <i className="icon-[solar--zip-file-bold-duotone] w-5 h-5"></i>
                          </span>

                          <span className="text-md text-slate-500 dark:text-slate-900">
                            {result.type.str}
                          </span>
                        </span>
                      </td>
                      <td className="px-2">
                        {/* Slots */}
                        <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                          <span className="pr-1 pt-1">
                            <i className="icon-[solar--settings-minimalistic-bold-duotone] w-5 h-5"></i>
                          </span>

                          <span className="text-md text-slate-500 dark:text-slate-900">
                            {result.slots.total} slots; {result.slots.free} free
                          </span>
                        </span>
                      </td>
                      <td className="px-2">
                        <button
                          className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                          onClick={() =>
                            download(
                              airDCPPSearchInstance.id,
                              result.id,
                              comicObjectId,
                              result.name,
                              result.size,
                              result.type,
                              airDCPPSocketInstance,
                            )
                          }
                        >
                          <span className="text-xs">Download</span>
                          <span className="w-5 h-5">
                            <i className="h-5 w-5 icon-[solar--download-bold-duotone]"></i>
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="">
            <article
              role="alert"
              className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
            >
              <div>
                The default search term is an auto-detected title; you may need
                to change it to get better matches if the auto-detected one
                doesn't work.
              </div>
            </article>

            <article
              role="alert"
              className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
            >
              <div>
                Searching via <strong>AirDC++</strong> is still in{" "}
                <strong>alpha</strong>. Some searches may take arbitrarily long,
                or may not work at all. Searches from{" "}
                <code className="font-hasklig">ADCS</code> hubs are more
                reliable than <code className="font-hasklig">NMDCS</code> ones.
              </div>
            </article>
          </div>
        )}
      </div>
    </>
  );
};

export default AcquisitionPanel;
