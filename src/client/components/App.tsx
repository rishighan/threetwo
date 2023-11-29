import React, { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";
import "../assets/scss/App.scss";

export const App = (): ReactElement => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default App;
