import React, {
  useCallback,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { SearchQuery, PriorityEnum, SearchResponse, SearchInstance } from "threetwo-ui-typings";
import ellipsize from "ellipsize";
import { Form, Field } from "react-final-form";
import { difference } from "../../shared/utils/object.utils";
import { isEmpty, isNil, map } from "lodash";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AIRDCPP_SERVICE_BASE_URI, SETTINGS_SERVICE_BASE_URI } from "../../constants/endpoints";
import type { Socket } from "socket.io-client";

interface IAcquisitionPanelProps {
  query: any;
  comicObjectId: string;
  comicObject: any;
  settings: any;
}

interface AirDCPPConfig {
  protocol: string;
  hostname: string;
  username: string;
  password: string;
}

interface SearchResult {
  id: string;
  name: string;
  type: {
    id: string;
    str: string;
  };
  size: number;
  slots: {
    total: number;
    free: number;
  };
  users: {
    user: {
      nicks: string;
      flags: string[];
    };
  };
  dupe?: any;
}

interface SearchInstanceData {
  id: number;
  owner: string;
  expires_in: number;
}

interface SearchInfo {
  query: {
    pattern: string;
    extensions: string[];
    file_type: string;
  };
}

interface Hub {
  hub_url: string;
  identity: {
    name: string;
  };
  value: string;
}

interface SearchFormValues {
  issueName: string;
}

export const AcquisitionPanel = (
  props: IAcquisitionPanelProps,
): ReactElement => {
  const socketRef = useRef<Socket>();
  const queryClient = useQueryClient();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [dcppQuery, setDcppQuery] = useState<SearchQuery | null>(null);
  const [airDCPPSearchResults, setAirDCPPSearchResults] = useState<SearchResult[]>([]);
  const [airDCPPSearchStatus, setAirDCPPSearchStatus] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [airDCPPSearchInstance, setAirDCPPSearchInstance] = useState<SearchInstanceData | null>(null);
  const [airDCPPSearchInfo, setAirDCPPSearchInfo] = useState<SearchInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { comicObjectId } = props;
  const issueName = props.query.issue.name || "";
  const sanitizedIssueName = issueName.replace(/[^a-zA-Z0-9 ]/g, " ");

  // Search timeout duration in milliseconds (30 seconds)
  const SEARCH_TIMEOUT_MS = 30000;

  useEffect(() => {
    const socket = useStore.getState().getSocket("manual");
    socketRef.current = socket;

    // --- Handlers ---
    const handleResultAdded = ({ result }: { result: SearchResult }) => {
      setAirDCPPSearchResults((prev) =>
        prev.some((r) => r.id === result.id) ? prev : [...prev, result],
      );
    };

    const handleResultUpdated = ({ result }: { result: SearchResult }) => {
      setAirDCPPSearchResults((prev) => {
        const idx = prev.findIndex((r) => r.id === result.id);
        if (idx === -1) return prev;
        if (JSON.stringify(prev[idx]) === JSON.stringify(result)) return prev;
        const next = [...prev];
        next[idx] = result;
        return next;
      });
    };

    const handleSearchInitiated = (data: { instance: SearchInstanceData }) => {
      setAirDCPPSearchInstance(data.instance);
      setIsSearching(true);
      setSearchError(null);
      
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set a timeout to stop searching after SEARCH_TIMEOUT_MS
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(false);
        console.log(`Search timeout reached after ${SEARCH_TIMEOUT_MS / 1000} seconds`);
      }, SEARCH_TIMEOUT_MS);
    };

    const handleSearchesSent = (data: { searchInfo: SearchInfo }) => {
      setAirDCPPSearchInfo(data.searchInfo);
    };

    const handleSearchError = (error: { message: string }) => {
      setSearchError(error.message || "Search failed");
      setIsSearching(false);
      
      // Clear timeout on error
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };

    const handleSearchCompleted = () => {
      setIsSearching(false);
      
      // Clear timeout when search completes
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };

    // --- Subscribe once ---
    socket.on("searchResultAdded", handleResultAdded);
    socket.on("searchResultUpdated", handleResultUpdated);
    socket.on("searchInitiated", handleSearchInitiated);
    socket.on("searchesSent", handleSearchesSent);
    socket.on("searchError", handleSearchError);
    socket.on("searchCompleted", handleSearchCompleted);

    return () => {
      socket.off("searchResultAdded", handleResultAdded);
      socket.off("searchResultUpdated", handleResultUpdated);
      socket.off("searchInitiated", handleSearchInitiated);
      socket.off("searchesSent", handleSearchesSent);
      socket.off("searchError", handleSearchError);
      socket.off("searchCompleted", handleSearchCompleted);
      
      // Clean up timeout on unmount
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [SEARCH_TIMEOUT_MS]);

  const {
    data: settings,
    isLoading: isLoadingSettings,
    isError: isSettingsError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: `${SETTINGS_SERVICE_BASE_URI}/getAllSettings`,
        method: "GET",
      }),
  });

  const { data: hubs, isLoading: isLoadingHubs } = useQuery({
    queryKey: ["hubs", settings?.data.directConnect?.client?.host],
    queryFn: async () =>
      await axios({
        url: `${AIRDCPP_SERVICE_BASE_URI}/getHubs`,
        method: "POST",
        data: {
          host: settings?.data.directConnect?.client?.host,
        },
      }),
    enabled: !!settings?.data?.directConnect?.client?.host,
  });

  // Get AirDC++ config from settings
  const airDCPPConfig: AirDCPPConfig | null = settings?.data?.directConnect?.client
    ? {
        protocol: settings.data.directConnect.client.protocol || "ws",
        hostname: typeof settings.data.directConnect.client.host === 'string'
          ? settings.data.directConnect.client.host
          : `${settings.data.directConnect.client.host?.hostname || 'localhost'}:${settings.data.directConnect.client.host?.port || '5600'}`,
        username: settings.data.directConnect.client.username || "admin",
        password: settings.data.directConnect.client.password || "password",
      }
    : null;

  useEffect(() => {
    if (hubs?.data && Array.isArray(hubs.data) && hubs.data.length > 0) {
      const dcppSearchQuery = {
        query: {
          pattern: `${sanitizedIssueName.replace(/#/g, "")}`,
          extensions: ["cbz", "cbr", "cb7"],
        },
        hub_urls: map(hubs.data, (item) => item.value),
        priority: 5,
      };
      setDcppQuery(dcppSearchQuery as any);
    }
  }, [hubs, sanitizedIssueName]);

  const search = async (searchData: any) => {
    if (!airDCPPConfig) {
      setSearchError("AirDC++ configuration not found in settings");
      return;
    }

    if (!socketRef.current) {
      setSearchError("Socket connection not available");
      return;
    }

    setAirDCPPSearchResults([]);
    setIsSearching(true);
    setSearchError(null);
    
    socketRef.current.emit("call", "socket.search", {
      query: searchData,
      namespace: "/manual",
      config: airDCPPConfig,
    });
  };

  const download = async (
    searchInstanceId: number,
    resultId: string,
    comicObjectId: string,
    name: string,
    size: number,
    type: SearchResult["type"],
    config: AirDCPPConfig,
  ): Promise<void> => {
    if (!socketRef.current) {
      console.error("Socket connection not available");
      return;
    }

    socketRef.current.emit(
      "call",
      "socket.download",
      {
        searchInstanceId,
        resultId,
        comicObjectId,
        name,
        size,
        type,
        config,
      },
      (data: any) => console.log("Download initiated:", data),
    );
  };

  const getDCPPSearchResults = async (searchQuery: SearchFormValues) => {
    if (!searchQuery.issueName || searchQuery.issueName.trim() === "") {
      setSearchError("Please enter a search term");
      return;
    }

    if (!hubs?.data || !Array.isArray(hubs.data) || hubs.data.length === 0) {
      setSearchError("No hubs configured");
      return;
    }

    const manualQuery = {
      query: {
        pattern: `${searchQuery.issueName.trim()}`,
        extensions: ["cbz", "cbr", "cb7"],
      },
      hub_urls: [hubs.data[0].hub_url],
      priority: 5,
    };

    search(manualQuery);
  };

  return (
    <>
      <div className="mt-5 mb-3">
        {isLoadingSettings || isLoadingHubs ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <i className="icon-[solar--refresh-bold-duotone] h-5 w-5 animate-spin" />
            Loading configuration...
          </div>
        ) : !isEmpty(hubs?.data) ? (
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
                            disabled={isSearching}
                          />

                          <button
                            className="sm:mt-0 min-w-fit rounded-r-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isSearching}
                          >
                            <div className="flex flex-row items-center">
                              {isSearching ? (
                                <>
                                  <i className="icon-[solar--refresh-bold-duotone] h-5 w-5 animate-spin mr-2" />
                                  Searching...
                                </>
                              ) : (
                                <>
                                  Search DC++
                                  <div className="h-5 w-5 ml-2">
                                    <img
                                      src="/src/client/assets/img/airdcpp_logo.svg"
                                      className="h-5 w-5"
                                    />
                                  </div>
                                </>
                              )}
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
          <article
            role="alert"
            className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600"
          >
            No AirDC++ hub configured. Please configure it in{" "}
            <code>Settings &gt; AirDC++ &gt; Hubs</code>.
          </article>
        )}
      </div>

      {/* Search Error Display */}
      {searchError && (
        <article
          role="alert"
          className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-red-500 bg-red-50 p-4 dark:border-s-4 dark:border-red-600 dark:bg-red-300 dark:text-slate-600"
        >
          <strong>Error:</strong> {searchError}
        </article>
      )}
      {/* configured hub */}
      {!isEmpty(hubs?.data) && hubs?.data[0] && (
        <span className="inline-flex items-center bg-green-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-green-300">
          <span className="pr-1 pt-1">
            <i className="icon-[solar--server-2-bold-duotone] w-5 h-5"></i>
          </span>
          {hubs.data[0].hub_url}
        </span>
      )}

      {/* AirDC++ search instance details */}
      {airDCPPSearchInstance &&
        airDCPPSearchInfo &&
        hubs?.data && (
          <div className="flex flex-row gap-3 my-5 font-hasklig">
            <div className="block max-w-sm h-fit p-6 text-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-slate-400 dark:border-gray-700">
              <dl>
                <dt>
                  <div className="mb-1">
                    {hubs.data.map((value: Hub, idx: number) => (
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
      <div className="">
        {airDCPPSearchResults.length > 0 ? (
          <div className="overflow-x-auto max-w-full mt-6">
            <table className="w-full table-auto text-sm text-gray-900 dark:text-slate-100">
              <thead>
                <tr className="border-b border-gray-300 dark:border-slate-700">
                  <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
                    Type
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
                    Slots
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold tracking-wide text-gray-500 dark:text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {map(
                  airDCPPSearchResults,
                  ({ dupe, type, name, id, slots, users, size }, idx) => (
                    <tr
                      key={idx}
                      className={
                        !isNil(dupe)
                          ? "border-b border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-700"
                          : "border-b border-gray-200 dark:border-slate-700 text-sm"
                      }
                    >
                      {/* NAME */}
                      <td className="whitespace-nowrap px-3 py-3 text-gray-700 dark:text-slate-300 max-w-xs">
                        <p className="mb-2">
                          {type.id === "directory" && (
                            <i className="fas fa-folder mr-1"></i>
                          )}
                          {ellipsize(name, 45)}
                        </p>
                        <dl>
                          <dd>
                            <div className="inline-flex flex-wrap gap-1">
                              {!isNil(dupe) && (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium py-0.5 px-2 rounded dark:bg-slate-400 dark:text-slate-900">
                                  <i className="icon-[solar--copy-bold-duotone] w-4 h-4"></i>
                                  Dupe
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium py-0.5 px-2 rounded dark:bg-slate-400 dark:text-slate-900">
                                <i className="icon-[solar--user-rounded-bold-duotone] w-4 h-4"></i>
                                {users.user.nicks}
                              </span>
                              {users.user.flags.map((flag: string, flagIdx: number) => (
                                <span
                                  key={flagIdx}
                                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium py-0.5 px-2 rounded dark:bg-slate-400 dark:text-slate-900"
                                >
                                  <i className="icon-[solar--tag-horizontal-bold-duotone] w-4 h-4"></i>
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </dl>
                      </td>

                      {/* TYPE */}
                      <td className="px-2 py-3">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium py-0.5 px-2 rounded dark:bg-slate-400 dark:text-slate-900">
                          <i className="icon-[solar--zip-file-bold-duotone] w-4 h-4"></i>
                          {type.str}
                        </span>
                      </td>

                      {/* SLOTS */}
                      <td className="px-2 py-3">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium py-0.5 px-2 rounded dark:bg-slate-400 dark:text-slate-900">
                          <i className="icon-[solar--settings-minimalistic-bold-duotone] w-4 h-4"></i>
                          {slots.total} slots; {slots.free} free
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-2 py-3">
                        <button
                          className="inline-flex items-center gap-1 rounded border border-green-500 bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-transparent hover:text-green-400 dark:border-green-300 dark:bg-green-300 dark:text-slate-900 dark:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            if (airDCPPSearchInstance && airDCPPConfig) {
                              download(
                                airDCPPSearchInstance.id,
                                id,
                                comicObjectId,
                                name,
                                size,
                                type,
                                airDCPPConfig,
                              );
                            }
                          }}
                          disabled={!airDCPPSearchInstance || !airDCPPConfig}
                        >
                          Download
                          <i className="icon-[solar--download-bold-duotone] w-4 h-4"></i>
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : !isSearching ? (
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
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-6 p-4">
            <i className="icon-[solar--refresh-bold-duotone] h-6 w-6 animate-spin" />
            Searching...
          </div>
        )}
      </div>
    </>
  );
};

export default AcquisitionPanel;
