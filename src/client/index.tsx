import React from "react";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Settings from "./components/Settings/Settings";
const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  AirDCPPSocketContextProvider,
  AirDCPPSocketContext,
} from "./context/AirDCPPSocket";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AirDCPPSocketContextProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={true} />
      </AirDCPPSocketContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
