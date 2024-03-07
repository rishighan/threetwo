import React, { useCallback, ReactElement, useEffect, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Field } from "react-final-form";
import {
  PROWLARR_SERVICE_BASE_URI,
  QBITTORRENT_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import { isEmpty, isNil } from "lodash";

export const TorrentSearchPanel = (props): ReactElement => {
  const { comicObjectId } = props;
  const [prowlarrSettingsData, setProwlarrSettingsData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [torrentToDownload, setTorrentToDownload] = useState("");

  const { data: qbittorrentConnectionResult } = useQuery({
    queryFn: async () =>
      axios({
        url: `${QBITTORRENT_SERVICE_BASE_URI}/connect`,
        method: "POST",
        data: {
          hostname: "localhost",
          protocol: "http",
          port: "8080",
          username: "admin",
          password: "password",
        },
      }),
    queryKey: ["qbittorrentConnection"],
  });

  const { data, isSuccess } = useQuery({
    queryFn: async () =>
      axios({
        url: `${PROWLARR_SERVICE_BASE_URI}/search`,
        method: "POST",
        data: {
          port: "9696",
          apiKey: "c4f42e265fb044dc81f7e88bd41c3367",
          offset: 0,
          categories: [7030],
          query: searchTerm,
          host: "localhost",
          limit: 100,
          type: "search",
          indexerIds: [2],
        },
      }),
    queryKey: ["prowlarrSettingsData", searchTerm],
    enabled: searchTerm !== "",
  });

  const { data: addTorrentResult } = useQuery({
    queryFn: async () =>
      axios({
        url: `${QBITTORRENT_SERVICE_BASE_URI}/addTorrent`,
        method: "POST",
        data: {
          torrentToDownload,
          comicObjectId,
        },
      }),
    queryKey: ["addTorrentResult"],
    enabled: !isNil(torrentToDownload) && searchTerm !== "",
  });
  console.log(torrentToDownload);
  const searchProwlarrIndexer = (evt) => {
    setSearchTerm(evt.searchTerm);
  };
  const downloadTorrent = (evt) => {
    console.log(evt);
    setTorrentToDownload(evt);
  };
  return (
    <>
      <div className="mt-5">
        <Form
          onSubmit={searchProwlarrIndexer}
          initialValues={{}}
          render={({ handleSubmit, form, submitting, pristine, values }) => (
            <form onSubmit={handleSubmit}>
              <Field name="searchTerm">
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
                          placeholder="Enter a search term"
                        />

                        <button
                          className="sm:mt-0 min-w-fit rounded-r-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                          type="submit"
                        >
                          <div className="flex flex-row">
                            Search Indexer
                            <div className="h-5 w-5 ml-1">
                              <i className="h-6 w-6 icon-[solar--magnet-bold-duotone]" />
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
      </div>
      {/* results */}
      <ul>
        {isSuccess &&
          data?.data.map((result, idx) => {
            return (
              <li key={idx}>
                <p>{result.fileName}</p>
                <p>{result.indexer}</p>
                <button
                  className="sm:mt-0 min-w-fit rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                  onClick={() => downloadTorrent(result.downloadUrl)}
                >
                  Download
                </button>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default TorrentSearchPanel;
