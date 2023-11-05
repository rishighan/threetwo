import React, { ReactElement, useContext, useEffect } from "react";
import Dashboard from "./Dashboard/Dashboard";
import Import from "./Import/Import";
import { ComicDetailContainer } from "./ComicDetail/ComicDetailContainer";
import TabulatedContentContainer from "./Library/TabulatedContentContainer";
import LibraryGrid from "./Library/LibraryGrid";
import Search from "./Search/Search";
import Settings from "./Settings/Settings";
import VolumeDetail from "./VolumeDetail/VolumeDetail";
import Downloads from "./Downloads/Downloads";

import { Routes, Route } from "react-router-dom";
import Navbar from "./shared/Navbar";
import "../assets/scss/App.scss";

import { SocketIOProvider } from "../context/SocketIOContext";
import socketIOConnectionInstance from "../shared/socket.io/instance";
import { isEmpty, isNil, isUndefined } from "lodash";
import {
  AIRDCPP_DOWNLOAD_PROGRESS_TICK,
  LS_SINGLE_IMPORT,
} from "../constants/action-types";

/**
 * Method that initializes an AirDC++ socket connection
 * 1. Initializes event listeners for download init, tick and complete events
 * 2. Handles errors in case the connection to AirDC++ is not established or terminated
 * @returns void
 */
const AirDCPPSocketComponent = (): ReactElement => {
  //   const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  //   const dispatch = useDispatch();
  //
  //   useEffect(() => {
  //     const initializeAirDCPPEventListeners = async () => {
  //       if (
  //         !isUndefined(airDCPPConfiguration.airDCPPState) &&
  //         !isEmpty(airDCPPConfiguration.airDCPPState.settings) &&
  //         !isEmpty(airDCPPConfiguration.airDCPPState.socket)
  //       ) {
  //         await airDCPPConfiguration.airDCPPState.socket.addListener(
  //           "queue",
  //           "queue_bundle_added",
  //           async (data) => {
  //             console.log("JEMEN:", data);
  //           },
  //         );
  //         // download tick listener
  //         await airDCPPConfiguration.airDCPPState.socket.addListener(
  //           `queue`,
  //           "queue_bundle_tick",
  //           async (downloadProgressData) => {
  //             dispatch({
  //               type: AIRDCPP_DOWNLOAD_PROGRESS_TICK,
  //               downloadProgressData,
  //             });
  //           },
  //         );
  //         // download complete listener
  //         await airDCPPConfiguration.airDCPPState.socket.addListener(
  //           `queue`,
  //           "queue_bundle_status",
  //           async (bundleData) => {
  //             let count = 0;
  //             if (bundleData.status.completed && bundleData.status.downloaded) {
  //               // dispatch the action for raw import, with the metadata
  //               if (count < 1) {
  //                 console.log(`[AirDCPP]: Download complete.`);
  //                 dispatch({
  //                   type: LS_SINGLE_IMPORT,
  //                   meta: { remote: true },
  //                   data: bundleData,
  //                 });
  //                 count += 1;
  //               }
  //             }
  //           },
  //         );
  //         console.log(
  //           "[AirDCPP]: Listener registered - listening to queue bundle download ticks",
  //         );
  //         console.log(
  //           "[AirDCPP]: Listener registered - listening to queue bundle changes",
  //         );
  //         console.log(
  //           "[AirDCPP]: Listener registered - listening to transfer completion",
  //         );
  //       }
  //     };
  //     initializeAirDCPPEventListeners();
  //   }, [airDCPPConfiguration]);
  return <></>;
};
export const App = (): ReactElement => {
  // useEffect(() => {
  //   // Check if there is a sessionId in localStorage
  //   const sessionId = localStorage.getItem("sessionId");
  //   if (!isNil(sessionId)) {
  //     // Resume the session
  //     dispatch({
  //       type: "RESUME_SESSION",
  //       meta: { remote: true },
  //       session: { sessionId },
  //     });
  //   } else {
  //     // Inititalize the session and persist the sessionId to localStorage
  //     socketIOConnectionInstance.on("sessionInitialized", (sessionId) => {
  //       localStorage.setItem("sessionId", sessionId);
  //     });
  //   }
  // }, []);
  return (
    <>
      {/* The rest of your application */}
      {/* <AirDCPPSocketComponent /> */};
    </>
  );
};

export default App;
