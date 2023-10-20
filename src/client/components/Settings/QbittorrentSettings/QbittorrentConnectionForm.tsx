import React, { ReactElement, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/store";
import { getQBitTorrentClientInfo } from "../../../actions/settings.actions";
import { saveSettings } from "../../../actions/settings.actions";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useGetAllSettingsQuery } from "../../../services/settings.api";
import { isUndefined } from "lodash";
import { useConnectToQBittorrentClientQuery } from "../../../services/torrents.api";

export const QbittorrentConnectionForm = (): ReactElement => {
  const dispatch = useAppDispatch();

  const onSubmit = useCallback(async (values) => {
    try {
      dispatch(saveSettings(values, "bittorrent"));
    } catch (error) {
      console.log(error);
    }
  }, []);

  return <></>;
};

export default QbittorrentConnectionForm;
