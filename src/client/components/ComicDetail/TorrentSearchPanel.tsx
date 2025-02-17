import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Form, Field } from "react-final-form";
import {
  PROWLARR_SERVICE_BASE_URI,
  QBITTORRENT_SERVICE_BASE_URI,
} from "../../constants/endpoints";
import { isEmpty, isNil } from "lodash";
import ellipsize from "ellipsize";
import prettyBytes from "pretty-bytes";

export const TorrentSearchPanel = (props) => {
  const { issueName, comicObjectId } = props;
  // Initialize searchTerm with issueName from props
  const [searchTerm, setSearchTerm] = useState({ issueName });
  const [torrentToDownload, setTorrentToDownload] = useState("");

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["searchResults", searchTerm.issueName],
    queryFn: async () => {
      return await axios({
        url: `${PROWLARR_SERVICE_BASE_URI}/search`,
        method: "POST",
        data: {
          prowlarrQuery: {
            port: "9696",
            apiKey: "38c2656e8f5d4790962037b8c4416a8f",
            offset: 0,
            categories: [7030],
            query: searchTerm.issueName,
            host: "localhost",
            limit: 100,
            type: "search",
            indexerIds: [2],
          },
        },
      });
    },
    enabled: !isNil(searchTerm.issueName) && searchTerm.issueName.trim() !== "", // Make sure searchTerm is not empty
  });
  const mutation = useMutation({
    mutationFn: async (newTorrent) =>
      axios.post(`${QBITTORRENT_SERVICE_BASE_URI}/addTorrent`, newTorrent),
    onSuccess: async (data) => {
      console.log(data);
    },
  });
  const searchIndexer = (values) => {
    setSearchTerm({ issueName: values.issueName }); // Update searchTerm based on the form submission
  };
  const downloadTorrent = (evt) => {
    const newTorrent = {
      comicObjectId,
      torrentToDownload: evt,
    };
    mutation.mutate(newTorrent);
  };
  return (
    <>
      <div className="mt-5">
        <Form
          onSubmit={searchIndexer}
          initialValues={searchTerm}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="issueName">
                {({ input, meta }) => (
                  <div className="max-w-fit">
                    <div className="flex flex-row bg-slate-300 dark:bg-slate-400 rounded-l-lg">
                      <div className="w-10 pl-2 pt-1 text-gray-400 dark:text-gray-200">
                        {/* Icon placeholder */}
                        <i className="icon-[solar--magnifer-bold-duotone] h-7 w-7" />
                      </div>
                      <input
                        {...input}
                        type="text"
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
                )}
              </Field>
            </form>
          )}
        />
      </div>

      <article
        role="alert"
        className="mt-4 rounded-lg text-sm max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
      >
        <div>
          The default search term is an auto-detected title; you may need to
          change it to get better matches if the auto-detected one doesn't work.
        </div>
      </article>
      {!isEmpty(data?.data) ? (
        <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200 dark:border-gray-500">
          <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-500 text-md">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-2 py-2 font-medium text-gray-900 dark:text-slate-200">
                  Name
                </th>
                <th className="whitespace-nowrap py-2 font-medium text-gray-900 dark:text-slate-200">
                  Indexer
                </th>

                <th className="whitespace-nowrap py-2 font-medium text-gray-900 dark:text-slate-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-500">
              {data?.data.map((result, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-3 text-gray-700 dark:text-slate-300 text-md">
                    <p>{ellipsize(result.fileName, 90)}</p>
                    {/* Seeders/Leechers */}
                    <div className="flex gap-3 mt-2">
                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--archive-up-minimlistic-bold-duotone] w-5 h-5"></i>
                        </span>

                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {result.seeders} seeders
                        </span>
                      </span>

                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--archive-down-minimlistic-bold-duotone] w-5 h-5"></i>
                        </span>

                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {result.leechers} leechers
                        </span>
                      </span>
                      {/* Size */}
                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--mirror-right-bold-duotone] w-5 h-5"></i>
                        </span>

                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {prettyBytes(result.size)}
                        </span>
                      </span>

                      {/* Files */}
                      <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--documents-bold-duotone] w-5 h-5"></i>
                        </span>

                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {result.files} files
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-gray-700 dark:text-slate-300 text-sm">
                    {result.indexer}
                  </td>

                  <td className="px-3 py-3 text-gray-700 dark:text-slate-300 text-sm">
                    <button
                      className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                      onClick={() => downloadTorrent(result.downloadUrl)}
                    >
                      <span className="text-xs">Download</span>
                      <span className="w-5 h-5">
                        <i className="h-5 w-5 icon-[solar--download-bold-duotone]"></i>
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};

export default TorrentSearchPanel;
