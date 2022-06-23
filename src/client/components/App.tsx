import React, { ReactElement, useContext, useEffect } from "react";
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
import { isEmpty, isUndefined } from "lodash";
import { AIRDCPP_DOWNLOAD_PROGRESS_TICK } from "../constants/action-types";
import { useDispatch } from "react-redux";

const AirDCPPSocketComponent = (): ReactElement => {
  const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  console.log(airDCPPConfiguration);
  const dispatch = useDispatch();
  useEffect(() => {
    const foo = async () => {
      if (
        !isUndefined(airDCPPConfiguration.airDCPPState) &&
        !isEmpty(airDCPPConfiguration.airDCPPState.settings) &&
        !isEmpty(airDCPPConfiguration.airDCPPState.socket)
      ) {
        await airDCPPConfiguration.airDCPPState.socket.addListener(
          "queue",
          "queue_bundle_added",
          async (data) => console.log("JEMEN:", data),
        );
        // download tick listener
        await airDCPPConfiguration.airDCPPState.socket.addListener(
          `queue`,
          "queue_bundle_tick",
          async (downloadProgressData) => {
            dispatch({
              type: AIRDCPP_DOWNLOAD_PROGRESS_TICK,
              downloadProgressData,
            });
          },
        );
        console.log(
          "[AirDCPP]: Listener registered - listening to queue bundle download ticks",
        );
        console.log(
          "[AirDCPP]: Listener registered - listening to queue bundle changes",
        );
      }
    };
    foo();
  }, [airDCPPConfiguration]);
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
