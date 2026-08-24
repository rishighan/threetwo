import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
const root = createRoot(document.getElementById("root")!);
import App from "./components/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorPage } from "./components/ui/layout/ErrorPage";
import "./shared/utils/i18n.util";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Settings = lazy(() => import("./components/pages/Settings/Settings"));
const Import = lazy(() => import("./components/pages/Import/Import"));
const Dashboard = lazy(() => import("./components/pages/Dashboard/Dashboard"));
const Search = lazy(() => import("./components/pages/Search/Search"));
const TabulatedContentContainer = lazy(() => import("./components/pages/Library/components/TabulatedContentContainer"));
const ComicDetailContainer = lazy(() => import("./components/pages/ComicDetail/ComicDetailContainer").then(m => ({ default: m.ComicDetailContainer })));
const Volumes = lazy(() => import("./components/pages/Volumes/Volumes"));
const VolumeDetails = lazy(() => import("./components/pages/VolumeDetail/VolumeDetail"));
const WantedComics = lazy(() => import("./components/pages/WantedComics/WantedComics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "settings", element: <Settings /> },
      {
        path: "library",
        element: <TabulatedContentContainer category="library" />,
      },
      {
        path: "comic/details/:comicObjectId",
        element: <ComicDetailContainer />,
      },
      { path: "import", element: <Import /> },
      { path: "search", element: <Search /> },
      { path: "volume/details/:comicObjectId", element: <VolumeDetails /> },
      { path: "volumes", element: <Volumes /> },
      { path: "wanted", element: <WantedComics /> },
    ],
  },
]);

root.render(
  <QueryClientProvider client={queryClient}>
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  </QueryClientProvider>,
);
