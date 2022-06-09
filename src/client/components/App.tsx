import React, { ReactElement, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./Dashboard/Dashboard";

import Import from "./Import";
import { ComicDetailContainer } from "./ComicDetail/ComicDetailContainer";
import LibraryContainer from "./Library/LibraryContainer";
import LibraryGrid from "./Library/LibraryGrid";
import Search from "./Search";
import Settings from "./Settings";
import VolumeDetail from "./VolumeDetail/VolumeDetail";
import PullList from "./PullList/PullList";
import WantedComics from "./WantedComics/WantedComics";
import Volumes from "./Volumes/Volumes";
import Downloads from "./Downloads/Downloads";

import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import "../assets/scss/App.scss";
import Notifications from "react-notification-system-redux";
import {
  AirDCPPSocketContextProvider,
  AirDCPPSocketContext,
} from "../context/AirDCPPSocket";
import { isNil } from "lodash";

//Optional styling
const style = {
  Containers: {
    DefaultStyle: {
      fontFamily: "inherit",
      position: "fixed",
      padding: "0 10px 10px 10px",
      zIndex: 9998,
      WebkitBoxSizing: "border-box",
      MozBoxSizing: "border-box",
      boxSizing: "border-box",
      height: "auto",
    },
    tr: {
      top: "40px",
      right: "10px",
    },
  },
  Title: {
    DefaultStyle: {
      fontSize: "14px",
      margin: "0 0 5px 0",
      padding: 0,
      fontWeight: "bold",
    },

    success: {
      color: "hsl(141, 71%, 48%)",
    },
  },
  NotificationItem: {
    // Override the notification item
    success: {
      // Applied to every notification, regardless of the notification level
      borderTop: "none",
      backgroundColor: "#FFF",
      borderRadius: "0.4rem",
      WebkitBoxShadow: "-7px 11px 25px -9px rgba(0, 0, 0, 0.3)",
      MozBoxShadow: "-7px 11px 25px -9px rgba(0, 0, 0, 0.3)",
      boxShadow: "-7px 11px 25px -9px rgba(0, 0, 0, 0.3)",
    },
  },
};

export const App = (): ReactElement => {
  const notifications = useSelector((state: RootState) => state.notifications);

  const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  const { AirDCPPSocket } = airDCPPConfiguration;
  useEffect(() => {
    const addQueueListener = async () => {
      if (!isNil(AirDCPPSocket)) {
        await AirDCPPSocket.addListener(
          "queue",
          "queue_bundle_added",
          async (data) => console.log("JEMEN:", data),
        );
        console.log(
          "[AirDCPP]: Listener registered - listening to queue bundle changes",
        );
      }
    };
    addQueueListener();
  }, [AirDCPPSocket]);
  return (
    <AirDCPPSocketContextProvider>
      <div>
        <Navbar />
        <Notifications
          notifications={notifications}
          style={style}
          newOnTop={true}
          allowHTML={true}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/import" element={<Import path={"./comics"} />} />
          <Route path="/library" element={<LibraryContainer />} />
          <Route path="/library-grid" element={<LibraryGrid />} />
          <Route path="/downloads" element={<Downloads data={{}} />} />
          <Route path="/search" element={<Search />} />
          <Route
            path={"/comic/details/:comicObjectId"}
            element={<ComicDetailContainer />}
          />
          <Route
            path={"/volume/details/:comicObjectId"}
            element={<VolumeDetail />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pull-list/all" element={<PullList />} />
          <Route path="/wanted/all" element={<WantedComics />} />
          <Route path="/volumes/all" element={<Volumes />} />
        </Routes>
      </div>
    </AirDCPPSocketContextProvider>
  );
};

export default App;
