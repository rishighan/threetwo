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
import { useDispatch, useSelector } from "react-redux";
import { RootState, SearchInstance } from "threetwo-ui-typings";
import ellipsize from "ellipsize";
import { Form, Field } from "react-final-form";
import { isEmpty, isNil, map } from "lodash";
import { AirDCPPSocketContext } from "../../context/AirDCPPSocket";
interface IAcquisitionPanelProps {
  query: any;
  comicObjectId: any;
  comicObject: any;
  settings: any;
}

export const AcquisitionPanel = (
  props: IAcquisitionPanelProps,
): ReactElement => {
  const issueName = props.query.issue.name || "";
  // const { settings } = props;
  const sanitizedIssueName = issueName.replace(/[^a-zA-Z0-9 ]/g, " ");

  // Selectors for picking state
  const airDCPPSearchResults = useSelector((state: RootState) => {
    return state.airdcpp.searchResults;
  });
  const isAirDCPPSearchInProgress = useSelector(
    (state: RootState) => state.airdcpp.isAirDCPPSearchInProgress,
  );
  const searchInfo = useSelector(
    (state: RootState) => state.airdcpp.searchInfo,
  );
  const searchInstance: SearchInstance = useSelector(
    (state: RootState) => state.airdcpp.searchInstance,
  );

  // const settings = useSelector((state: RootState) => state.settings.data);
  const airDCPPConfiguration = useContext(AirDCPPSocketContext);

  const dispatch = useDispatch();
  const [dcppQuery, setDcppQuery] = useState({});

  useEffect(() => {
    if (!isEmpty(airDCPPConfiguration.airDCPPState.settings)) {
      // AirDC++ search query
      const dcppSearchQuery = {
        query: {
          pattern: `${sanitizedIssueName.replace(/#/g, "")}`,
          extensions: ["cbz", "cbr", "cb7"],
        },
        hub_urls: map(
          airDCPPConfiguration.airDCPPState.settings.directConnect.client.hubs,
          (item) => item.value,
        ),
        priority: 5,
      };
      setDcppQuery(dcppSearchQuery);
    }
  }, [airDCPPConfiguration]);

  const getDCPPSearchResults = useCallback(
    async (searchQuery) => {
      const manualQuery = {
        query: {
          pattern: `${searchQuery.issueName}`,
          extensions: ["cbz", "cbr", "cb7"],
        },
        hub_urls: map(
          airDCPPConfiguration.airDCPPState.settings.directConnect.client.hubs,
          (item) => item.value,
        ),
        priority: 5,
      };
      dispatch(
        search(manualQuery, airDCPPConfiguration.airDCPPState.socket, {
          username: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.username}`,
          password: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.password}`,
        }),
      );
    },
    [dispatch, airDCPPConfiguration],
  );

  // download via AirDC++
  const downloadDCPPResult = useCallback(
    (searchInstanceId, resultId, name, size, type) => {
      dispatch(
        downloadAirDCPPItem(
          searchInstanceId, resultId,
          props.comicObjectId,
          name, size, type,
          airDCPPConfiguration.airDCPPState.socket,
          {
            username: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.username}`,
            password: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.password}`,
          },
        ),
      );
      // this is to update the download count badge on the downloads tab
      dispatch(
        getBundlesForComic(
          props.comicObjectId,
          airDCPPConfiguration.airDCPPState.socket,
          {
            username: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.username}`,
            password: `${airDCPPConfiguration.airDCPPState.settings.directConnect.client.host.password}`,
          },
        ),
      );
    },
    [airDCPPConfiguration],
  );
  return (
    <>
      <div className="comic-detail columns">
        {!isEmpty(airDCPPConfiguration.airDCPPState.socket) ? (
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
                              Use this to perform a manual search.
                            </span>
                          </div>
                        );
                      }}
                    </Field>

                    <div className="column">
                      <button
                        type="submit"
                        className={
                          isAirDCPPSearchInProgress
                            ? "button is-loading is-warning"
                            : "button"
                        }
                      >
                        <span className="icon is-small">
                          <img src="/img/airdcpp_logo.svg" />
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
                <code>Settings</code>.
              </div>
            </article>
          </div>
        )}
      </div>

      {/* AirDC++ search instance details */}
      {!isNil(searchInfo) && !isNil(searchInstance) && (
        <div className="columns">
          <div className="column is-one-quarter is-size-7">
            <div className="card">
              <div className="card-content">
                <dl>
                  <dt>
                    <div className="tags mb-1">
                      {airDCPPConfiguration.airDCPPState.settings.directConnect.client.hubs.map(
                        ({ value }) => (
                          <span className="tag is-warning" key={value}>
                            {value}
                          </span>
                        ),
                      )}
                    </div>
                  </dt>
                  <dt>
                    Query:{" "}
                    <span className="has-text-weight-semibold">
                      {searchInfo.query.pattern}
                    </span>
                  </dt>
                  <dd>Extensions: {searchInfo.query.extensions.join(", ")}</dd>
                  <dd>File type: {searchInfo.query.file_type}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="column is-one-quarter is-size-7">
            <div className="card">
              <div className="card-content">
                <dl>
                  <dt>Search Instance: {searchInstance.id}</dt>
                  <dt>Owned by {searchInstance.owner}</dt>
                  <dd>Expires in: {searchInstance.expires_in}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

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
                          ) : null}{" "}
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
                        <a
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
                          <i className="fas fa-file-download"></i>
                        </a>
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
                Searching via <strong>AirDC++</strong> is still in{" "}
                <strong>alpha</strong>. Some searches may take arbitrarily long,
                or may not work at all. Searches from <code>ADCS</code> hubs are
                more reliable than <code>NMDCS</code> ones.
              </div>
            </article>
          </div>
        )}
      </div>
    </>
  );
};

export default AcquisitionPanel;
