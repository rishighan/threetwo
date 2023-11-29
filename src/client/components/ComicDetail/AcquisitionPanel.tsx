import React, { useCallback, ReactElement, useEffect, useState } from "react";
import {
  downloadAirDCPPItem,
  getBundlesForComic,
  sleep,
} from "../../actions/airdcpp.actions";
import { SearchQuery, PriorityEnum, SearchResponse } from "threetwo-ui-typings";
import { RootState, SearchInstance } from "threetwo-ui-typings";
import ellipsize from "ellipsize";
import { Form, Field } from "react-final-form";
import { difference } from "../../shared/utils/object.utils";
import { isEmpty, isNil, map } from "lodash";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";

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
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketInstance: state.airDCPPSocketInstance,
      airDCPPClientConfiguration: state.airDCPPClientConfiguration,
      airDCPPSessionInformation: state.airDCPPSessionInformation,
    })),
  );

  /**
   * Get the hubs list from an AirDCPP Socket
   */
  const { data: hubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => await airDCPPSocketInstance.get(`hubs`),
  });

  const issueName = props.query.issue.name || "";
  // const { settings } = props;
  const sanitizedIssueName = issueName.replace(/[^a-zA-Z0-9 ]/g, " ");

  // Selectors for picking state
  // const airDCPPSearchResults = useSelector((state: RootState) => {
  //   return state.airdcpp.searchResults;
  // });
  // const isAirDCPPSearchInProgress = useSelector(
  //   (state: RootState) => state.airdcpp.isAirDCPPSearchInProgress,
  // );
  // const searchInfo = useSelector(
  //   (state: RootState) => state.airdcpp.searchInfo,
  // );
  // const searchInstance: SearchInstance = useSelector(
  //   (state: RootState) => state.airdcpp.searchInstance,
  // );

  // const settings = useSelector((state: RootState) => state.settings.data);
  // const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  interface SearchData {
    query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
    hub_urls: string[] | undefined | null;
    priority: PriorityEnum;
  }
  const [dcppQuery, setDcppQuery] = useState({});
  const [airDCPPSearchResults, setAirDCPPSearchResults] = useState([]);

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

  const search = async (data: SearchData, ADCPPSocket: any) => {
    try {
      if (!ADCPPSocket.isConnected()) {
        await ADCPPSocket();
      }
      const instance: SearchInstance = await ADCPPSocket.post("search");
      // dispatch({
      //   type: AIRDCPP_SEARCH_IN_PROGRESS,
      // });

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
          if (currentInstance.result_count === 0) {
            // ...nothing was received, show an informative message to the user
            console.log("No more search results.");
          }

          // The search can now be considered to be "complete"
          // If there's an "in progress" indicator in the UI, that could also be disabled here
          // dispatch({
          //   type: AIRDCPP_HUB_SEARCHES_SENT,
          //   searchInfo,
          //   instance,
          // });
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
  console.log("yaman", airDCPPSearchResults);
  return (
    <>
      <div className="comic-detail columns">
        {!isEmpty(airDCPPSocketInstance) ? (
          <Form
            onSubmit={getDCPPSearchResults}
            initialValues={{
              issueName,
            }}
            render={({ handleSubmit, form, submitting, pristine, values }) => (
              <form
                onSubmit={handleSubmit}
                className="column is-three-quarters"
              >
                <div className="box search">
                  <div className="columns">
                    <Field name="issueName">
                      {({ input, meta }) => {
                        return (
                          <div className="column is-two-thirds">
                            <input
                              {...input}
                              className="input main-search-bar is-medium"
                              placeholder="Type an issue/volume name"
                            />
                            <span className="help is-clearfix is-light is-info"></span>
                          </div>
                        );
                      }}
                    </Field>

                    <div className="column">
                      <button
                        type="submit"
                        className={
                          false
                            ? "button is-loading is-warning"
                            : "button is-success is-light"
                        }
                      >
                        <span className="icon is-small">
                          <img src="/src/client/assets/img/airdcpp_logo.svg" />
                        </span>
                        <span className="airdcpp-text">Search on AirDC++</span>
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* AirDC++ results */}
      <div className="columns">
        {!isNil(airDCPPSearchResults) && !isEmpty(airDCPPSearchResults) ? (
          <div className="column">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Slots</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {map(airDCPPSearchResults, ({ result }, idx) => {
                  return (
                    <tr
                      key={idx}
                      className={
                        !isNil(result.dupe) ? "dupe-search-result" : ""
                      }
                    >
                      <td>
                        <p className="mb-2">
                          {result.type.id === "directory" ? (
                            <i className="fas fa-folder"></i>
                          ) : null}
                          {ellipsize(result.name, 70)}
                        </p>

                        <dl>
                          <dd>
                            <div className="tags">
                              {!isNil(result.dupe) ? (
                                <span className="tag is-warning">Dupe</span>
                              ) : null}
                              <span className="tag is-light is-info">
                                {result.users.user.nicks}
                              </span>
                              {result.users.user.flags.map((flag, idx) => (
                                <span className="tag is-light" key={idx}>
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </dl>
                      </td>
                      <td>
                        <span className="tag is-light is-info">
                          {result.type.id === "directory"
                            ? "directory"
                            : result.type.str}
                        </span>
                      </td>
                      <td>
                        <div className="tags has-addons">
                          <span className="tag is-success">
                            {result.slots.free} free
                          </span>
                          <span className="tag is-light">
                            {result.slots.total}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="button is-small is-light is-success"
                          onClick={() =>
                            downloadDCPPResult(
                              searchInstance.id,
                              result.id,
                              result.name,
                              result.size,
                              result.type,
                            )
                          }
                        >
                          <span className="icon">
                            <i className="fas fa-file-download"></i>
                          </span>
                          <span>Download </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="column is-three-fifths">
            <article className="message is-info">
              <div className="message-body is-size-6 is-family-secondary">
                <p>
                  The default search term is an auto-detected title; you may
                  need to change it to get better matches if the auto-detected
                  one doesn't work.
                </p>
              </div>
            </article>

            <article className="message is-warning">
              <div className="message-body is-size-6 is-family-secondary">
                <p className="content">
                  Searching via <strong>AirDC++</strong> is still in
                  <strong>alpha</strong>. Some searches may take arbitrarily
                  long, or may not work at all. Searches from <code>ADCS</code>
                  hubs are more reliable than <code>NMDCS</code> ones.
                </p>
              </div>
            </article>
          </div>
        )}
      </div>
    </>
  );
};

export default AcquisitionPanel;
