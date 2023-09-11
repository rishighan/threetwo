import React, { ReactElement, useCallback, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { getQBitTorrentClientInfo } from "../../../actions/settings.actions";

export const QbittorrentConnectionForm = (): ReactElement => {
  const dispatch = useDispatch();
  const torrents = useSelector((state: RootState) => state.settings.torrentsList)

  useEffect(() => {
	  dispatch(getQBitTorrentClientInfo());
  }, [])
  const handleSubmit  = () => {}
  return (<>
	 <pre> {JSON.stringify(torrents, null, 4)} </pre>
   
   <Form
     onSubmit={handleSubmit}
     // validate={}
     /* initialValues={} */
     render={({ handleSubmit }) => (
       <form onSubmit={handleSubmit}>
         <h2>Configure Qbittorrent</h2>
         
       </form>
     )}
   />
  
  </>);
};

export default QbittorrentConnectionForm;
