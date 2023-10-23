import React, { ReactElement, useCallback } from "react";
import { saveSettings } from "../../../actions/settings.actions";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useConnectToQBittorrentClientQuery } from "../../../services/torrents.api";

export const QbittorrentConnectionForm = (): ReactElement => {
  const { data, isLoading } = useConnectToQBittorrentClientQuery({});
  const onSubmit = useCallback(async (values) => {
    try {
      dispatch(saveSettings(values, "bittorrent"));
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      {!isLoading && (
        <ConnectionForm
          initialData={data?.bittorrent.client.host}
          submitHandler={onSubmit}
          formHeading={"Qbittorrent Configuration"}
        />
      )}
      <pre>{JSON.stringify(data?.qbittorrentClientInfo, null, 2)}</pre>
    </>
  );
};

export default QbittorrentConnectionForm;
