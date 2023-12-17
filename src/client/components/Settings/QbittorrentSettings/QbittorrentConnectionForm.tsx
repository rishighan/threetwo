import React, { ReactElement } from "react";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const QbittorrentConnectionForm = (): ReactElement => {
  const queryClient = new QueryClient();
  // fetch settings
  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });
  console.log(data);
  const hostDetails = data?.data?.bittorrent?.client?.host;
  // connect to qbittorrent client
  const { data: connectionDetails } = useQuery({
    queryKey: [],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3060/api/qbittorrent/connect",
        method: "POST",
        data: hostDetails,
      }),
    enabled: !!hostDetails,
  });
  // get qbittorrent client info
  const { data: qbittorrentClientInfo } = useQuery({
    queryKey: ["qbittorrentClientInfo"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3060/api/qbittorrent/getClientInfo",
        method: "GET",
      }),
    enabled: !!connectionDetails,
  });
  console.log(qbittorrentClientInfo);
  // Update action using a mutation
  const { mutate } = useMutation({
    mutationFn: async (values) =>
      await axios({
        url: `http://localhost:3000/api/settings/saveSettings`,
        method: "POST",
        data: { settingsPayload: values, settingsKey: "bittorrent" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  if (isError)
    return (
      <>
        <pre>Something went wrong connecting to qBittorrent.</pre>
      </>
    );
  if (!isLoading) {
    return (
      <>
        <ConnectionForm
          initialData={hostDetails}
          formHeading={"qBittorrent Configuration"}
          submitHandler={mutate}
        />

        <span className="flex items-center mt-10 mb-4">
          <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
            qBittorrent Client Information
          </span>
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
        </span>

        <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-slate-400 dark:border-gray-700">
          <span className="inline-flex justify-center rounded-full bg-emerald-100 mb-4 px-2 py-0.5 text-emerald-700">
            <span className="h-5 w-6">
              <i className="icon-[solar--plug-circle-bold] h-5 w-5"></i>
            </span>
            <p className="whitespace-nowrap text-sm">Connected</p>
          </span>
          <p className="font-hasklig text-sm text-slate-700 dark:text-slate-700">
            <pre> {JSON.stringify(qbittorrentClientInfo?.data, null, 4)}</pre>
          </p>
        </div>
      </>
    );
  }
};

export default QbittorrentConnectionForm;
