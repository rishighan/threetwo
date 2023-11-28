import React, {
  useCallback,
  useContext,
  ReactElement,
  useEffect,
  useState,
} from "react";
import {
  search,
  downloadAirDCPPItem,
  getBundlesForComic,
} from "../../actions/airdcpp.actions";
import { RootState, SearchInstance } from "threetwo-ui-typings";
import ellipsize from "ellipsize";
import { Form, Field } from "react-final-form";
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

  console.log("narangi umlaut", hubs);
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

  const [dcppQuery, setDcppQuery] = useState({});

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

  const getDCPPSearchResults = async (searchQuery) => {
    console.log(hubs);
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
                            <span className="help is-clearfix is-light is-info">
                              This is the auto-detected title; you may need to
                              change it to get better matches if the
                              auto-detected one doesn't work.
                            </span>
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
    </>
  );
};

export default AcquisitionPanel;
