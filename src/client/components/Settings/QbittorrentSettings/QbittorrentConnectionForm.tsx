import React, { ReactElement, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQBitTorrentClientInfo } from "../../../actions/settings.actions";
import { saveSettings } from "../../../actions/settings.actions";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { isUndefined } from "lodash";

export const QbittorrentConnectionForm = (): ReactElement => {
  const dispatch = useDispatch();
  const torrents = useSelector(
    (state: RootState) => state.settings.torrentsList,
  );

  const qBittorrentSettings = useSelector((state: RootState) => {
    if (!isUndefined(state.settings.data.bittorrent)) {
      return state.settings.data.bittorrent.client.host;
    }
  });

  useEffect(() => {
    if (!isUndefined(qBittorrentSettings)) {
      dispatch(getQBitTorrentClientInfo(qBittorrentSettings));
    }
  }, []);

  const onSubmit = useCallback(async (values) => {
    try {
      dispatch(saveSettings(values, "bittorrent"));
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <ConnectionForm
        initialData={qBittorrentSettings}
        submitHandler={onSubmit}
      />
      <pre> {torrents && JSON.stringify(torrents, null, 4)} </pre>
    </>
  );
};

export default QbittorrentConnectionForm;
