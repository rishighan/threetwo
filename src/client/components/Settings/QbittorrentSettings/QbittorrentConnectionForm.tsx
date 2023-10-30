import React, { ReactElement, useCallback, useEffect } from "react";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const QbittorrentConnectionForm = (): ReactElement => {
  // fetch settings
  const {
    data: data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["host"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });

  const hostDetails = data?.data.bittorrent.client.host;
  // connect to qbittorrent client
  useQuery({
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
  const {
    data: {},
  } = useQuery({
    queryKey: ["qbittorrentClientInfo"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3060/api/qbittorrent/getClientInfo",
        method: "GET",
      }),
    enabled: !!hostDetails,
  });

  const onSubmit = useCallback(async (values) => {
    try {
      // dispatch(saveSettings(values, "bittorrent"));
    } catch (error) {
      console.log(error);
    }
  }, []);

  return <></>;
};

export default QbittorrentConnectionForm;
