import { createRoot } from "react-dom/client";
import App from "./components/App";
import { createBrowserRouter, RouterProvider } from "react-router";
import Settings from "./components/Settings/Settings";
import { ErrorPage } from "./components/shared/ErrorPage";
import i18n from "./shared/utils/i18n.util";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Import from "./components/Import/Import";
import Dashboard from "./components/Dashboard/Dashboard";
import Search from "./components/Search/Search";
import TabulatedContentContainer from "./components/Library/TabulatedContentContainer";
import { ComicDetailContainer } from "./components/ComicDetail/ComicDetailContainer";
import Volumes from "./components/Volumes/Volumes";
import VolumeDetails from "./components/VolumeDetail/VolumeDetail";
import WantedComics from "./components/WantedComics/WantedComics";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />, 
      errorElement: <ErrorPage />, 
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "settings", element: <Settings /> },
        { path: "library", element: <TabulatedContentContainer category="library" /> },
        { path: "comic/details/:comicObjectId", element: <ComicDetailContainer /> },
        { path: "import", element: <Import path={"./comics"} /> },
        { path: "search", element: <Search /> },
        { path: "volume/details/:comicObjectId", element: <VolumeDetails /> },
        { path: "volumes", element: <Volumes /> },
        { path: "wanted", element: <WantedComics /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </QueryClientProvider>
  );
} else {
  console.error("Root element not found");
}
