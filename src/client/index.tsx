import React from "react";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Settings from "./components/Settings/Settings";
import { ErrorPage } from "./components/shared/ErrorPage";
const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Import from "./components/Import/Import";
import Dashboard from "./components/Dashboard/Dashboard";
import TabulatedContentContainer from "./components/Library/TabulatedContentContainer";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "settings", element: <Settings /> },
      {
        path: "library",
        element: <TabulatedContentContainer category="library" />,
      },
      { path: "import", element: <Import path={"./comics"} /> },
    ],
  },
]);

root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <ReactQueryDevtools initialIsOpen={true} />
  </QueryClientProvider>,
);
