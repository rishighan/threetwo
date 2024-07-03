import React, { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { Navbar2 } from "./shared/Navbar2";
import { ToastContainer } from "react-toastify";
import "../assets/scss/App.scss";

export const App = (): ReactElement => {
  return (
    <>
      <Navbar2 />
      <Outlet />
      <ToastContainer stacked hideProgressBar />
    </>
  );
};

export default App;
