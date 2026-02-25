import React, { ReactElement, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar2 } from "./shared/Navbar2";
import { ToastContainer } from "react-toastify";
import "../assets/scss/App.css";
import { useStore } from "../store";

export const App = (): ReactElement => {
  useEffect(() => {
    useStore.getState().getSocket("/"); // Connect to the base namespace
  }, []);
  
  return (
    <>
      <Navbar2 />
      <Outlet />
      <ToastContainer stacked hideProgressBar />
    </>
  );
};

export default App;
