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
import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";
import "../assets/scss/App.scss";

import { SocketIOProvider } from "../context/SocketIOContext";
import socketIOConnectionInstance from "../shared/socket.io/instance";
import { isEmpty, isNil, isUndefined } from "lodash";
import {
  AIRDCPP_DOWNLOAD_PROGRESS_TICK,
  LS_SINGLE_IMPORT,
} from "../constants/action-types";

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
      <Navbar />
      <Outlet />
    </>
  );
};

export default App;
