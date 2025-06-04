import React, {
  useCallback,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { AIRDCPP_SERVICE_BASE_URI } from "../../constants/endpoints";
import type { Socket } from "socket.io-client";

interface IAcquisitionPanelProps {
  query: any;
  comicObjectId: any;
  comicObject: any;
  settings: any;
}

export const AcquisitionPanel = (
  props: IAcquisitionPanelProps,
): ReactElement => {
  const socketRef = useRef<Socket>();
  const queryClient = useQueryClient();

  const [dcppQuery, setDcppQuery] = useState({});
  const [airDCPPSearchResults, setAirDCPPSearchResults] = useState<any[]>([]);
  const [airDCPPSearchStatus, setAirDCPPSearchStatus] = useState(false);
  const [airDCPPSearchInstance, setAirDCPPSearchInstance] = useState<any>({});
  const [airDCPPSearchInfo, setAirDCPPSearchInfo] = useState<any>({});

  const { comicObjectId } = props;
  const issueName = props.query.issue.name || "";
  const sanitizedIssueName = issueName.replace(/[^a-zA-Z0-9 ]/g, " ");

  useEffect(() => {
    const socket = useStore.getState().getSocket("manual");
    socketRef.current = socket;

    // --- Handlers ---
    const handleResultAdded = ({ result }: any) => {
      setAirDCPPSearchResults((prev) =>
        prev.some((r) => r.id === result.id) ? prev : [...prev, result],
      );
    };

    const handleResultUpdated = ({ result }: any) => {
      setAirDCPPSearchResults((prev) => {
        const idx = prev.findIndex((r) => r.id === result.id);
        if (idx === -1) return prev;
        if (JSON.stringify(prev[idx]) === JSON.stringify(result)) return prev;
        const next = [...prev];
        next[idx] = result;
        return next;
      });
    };

    const handleSearchInitiated = (data: any) => {
      setAirDCPPSearchInstance(data.instance);
    };

    const handleSearchesSent = (data: any) => {
      setAirDCPPSearchInfo(data.searchInfo);
    };

    // --- Subscribe once ---
    socket.on("searchResultAdded", handleResultAdded);
    socket.on("searchResultUpdated", handleResultUpdated);
    socket.on("searchInitiated", handleSearchInitiated);
    socket.on("searchesSent", handleSearchesSent);

    return () => {
      socket.off("searchResultAdded", handleResultAdded);
      socket.off("searchResultUpdated", handleResultUpdated);
      socket.off("searchInitiated", handleSearchInitiated);
      socket.off("searchesSent", handleSearchesSent);
      // if you want to fully close the socket:
      // useStore.getState().disconnectSocket("/manual");
    };
  }, []);

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });

  const { data: hubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () =>
      await axios({
        url: `${AIRDCPP_SERVICE_BASE_URI}/getHubs`,
        method: "POST",
        data: {
          host: settings?.data.directConnect?.client?.host,
        },
      }),
    enabled: !isEmpty(settings?.data.directConnect?.client?.host),
  });

  useEffect(() => {
    const dcppSearchQuery = {
      query: {
        pattern: `${sanitizedIssueName.replace(/#/g, "")}`,
        extensions: ["cbz", "cbr", "cb7"],
      },
      hub_urls: map(hubs?.data, (item) => item.value),
      priority: 5,
    };
    setDcppQuery(dcppSearchQuery);
  }, [hubs, sanitizedIssueName]);

  const search = async (searchData: any) => {
    setAirDCPPSearchResults([]);
    socketRef.current?.emit("call", "socket.search", {
      query: searchData,
      namespace: "/manual",
      config: {
        protocol: `ws`,
        hostname: `192.168.1.119:5600`,
        username: `admin`,
        password: `password`,
      },
    });
  };

  const download = async (
    searchInstanceId: Number,
    resultId: String,
    comicObjectId: String,
    name: String,
    size: Number,
    type: any,
    config: any,
  ): Promise<void> => {
    socketRef.current?.emit(
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
      (data: any) => console.log(data),
    );
  };

  const getDCPPSearchResults = async (searchQuery) => {
    const manualQuery = {
      query: {
        pattern: `${searchQuery.issueName}`,
        extensions: ["cbz", "cbr", "cb7"],
      },
      hub_urls: [hubs?.data[0].hub_url],
      priority: 5,
    };

    search(manualQuery);
  };

  return (
    <>
      <div className="mt-5 mb-3">
        {!isEmpty(hubs?.data) ? (
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
          <article
            role="alert"
            className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600"
          >
            No AirDC++ hub configured. Please configure it in{" "}
            <code>Settings &gt; AirDC++ &gt; Hubs</code>.
          </article>
        )}
      </div>
      {/* configured hub */}
      {!isEmpty(hubs?.data) && (
        <span className="inline-flex items-center bg-green-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-green-300">
          <span className="pr-1 pt-1">
            <i className="icon-[solar--server-2-bold-duotone] w-5 h-5"></i>
          </span>
          {hubs && hubs?.data[0].hub_url}
        </span>
      )}

      {/* AirDC++ search instance details */}
      {!isNil(airDCPPSearchInstance) &&
        !isEmpty(airDCPPSearchInfo) &&
        !isNil(hubs) && (
          <div className="flex flex-row gap-3 my-5 font-hasklig">
            <div className="block max-w-sm h-fit p-6 text-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-slate-400 dark:border-gray-700">
              <dl>
                <dt>
                  <div className="mb-1">
                    {hubs?.data.map((value, idx: string) => (
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
        {!isNil(airDCPPSearchResults) && !isEmpty(airDCPPSearchResults) ? (
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
                              {users.user.flags.map((flag, idx) => (
                                <span
                                  key={idx}
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
                          className="inline-flex items-center gap-1 rounded border border-green-500 bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-transparent hover:text-green-400 dark:border-green-300 dark:bg-green-300 dark:text-slate-900 dark:hover:bg-transparent"
                          onClick={() =>
                            download(
                              airDCPPSearchInstance.id,
                              id,
                              comicObjectId,
                              name,
                              size,
                              type,
                              {
                                protocol: `ws`,
                                hostname: `192.168.1.119:5600`,
                                username: `admin`,
                                password: `password`,
                              },
                            )
                          }
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
