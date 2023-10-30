import React, { ReactElement, useCallback } from "react";
import { saveSettings } from "../../../actions/settings.actions";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";

export const QbittorrentConnectionForm = (): ReactElement => {
  const onSubmit = useCallback(async (values) => {
    try {
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <ConnectionForm
        initialData={data?.bittorrent.client.host}
        submitHandler={onSubmit}
        formHeading={"Qbittorrent Configuration"}
      />
      <pre>{JSON.stringify(data?.qbittorrentClientInfo, null, 2)}</pre>
    </>
  );
};

export default QbittorrentConnectionForm;
