import React, { ReactElement, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQBitTorrentClientInfo } from "../../../actions/settings.actions";

export const QbittorrentConnectionForm = (): ReactElement => {
  const dispatch = useDispatch();
  const torrents = useSelector((state: RootState) => state.settings.torrentsList)

  useEffect(() => {
	  dispatch(getQBitTorrentClientInfo());
  }, [])

  return (
	<div className="is-clearfix">
	 <pre> {JSON.stringify(torrents, null, 4)} </pre>
	</div>
  );
};

export default QbittorrentConnectionForm;
