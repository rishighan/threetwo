import React, { ReactElement, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { Navbar2 } from "./shared/Navbar2";
import { ToastContainer } from "react-toastify";
import "../assets/scss/App.css";
import { useStore } from "../store";
import { apolloClient } from "../graphql/client";

export const App = (): ReactElement => {
  useEffect(() => {
    useStore.getState().getSocket("/"); // Connect to the base namespace
  }, []);
  
  return (
    <ApolloProvider client={apolloClient}>
      <Navbar2 />
      <Outlet />
      <ToastContainer stacked hideProgressBar />
    </ApolloProvider>
  );
};

export default App;
