import React, { ReactElement, useCallback, useEffect } from "react";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useQuery, useMutation } from "@tanstack/react-query";
import { saveSettings } from "../../../actions/settings.actions";
import axios from "axios";

export const QbittorrentConnectionForm = (): ReactElement => {
  // axios interceptors to destructure response
  // fetch settings
  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });
  const hostDetails = data?.data.bittorrent.client.host;
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
  console.log(qbittorrentClientInfo?.data);

  const { mutate } = useMutation({
    mutationFn: async (values) =>
      await axios({
        url: `http://localhost:3000/api/settings/saveSettings`,
        method: "POST",
        data: { settingsPayload: values, settingsKey: "bittorrent" },
      }),
  });

  return (
    <>
      <ConnectionForm
        initialData={hostDetails}
        formHeading={"qBittorrent Configuration"}
        submitHandler={mutate}
      />

      <pre className="mt-5">
        {JSON.stringify(qbittorrentClientInfo?.data, null, 4)}
      </pre>
    </>
  );
};

export default QbittorrentConnectionForm;
