import React, { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { Navbar2 } from "./shared/Navbar2";
import "../assets/scss/App.scss";

export const App = (): ReactElement => {
  return (
    <>
      <Navbar2 />
      <Outlet />
    </>
  );
};

export default App;
