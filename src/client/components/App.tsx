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
import {
  AirDCPPSocketContextProvider,
  AirDCPPSocketContext,
} from "../context/AirDCPPSocket";
import { isEmpty, isNil, isUndefined } from "lodash";

const AirDCPPSocketComponent = (): ReactElement => {
  const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  const { AirDCPPSocket, settings } = airDCPPConfiguration;
  useEffect(() => {
    const foo = async () => {
      if (!isUndefined(AirDCPPSocket)) {
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
    foo();
  }, [settings]);
  return <></>;
};
export const App = (): ReactElement => {
  return (
    <AirDCPPSocketContextProvider>
      <div>
        <AirDCPPSocketComponent />
        <Navbar />
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
