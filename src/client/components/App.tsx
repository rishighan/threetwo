/**
 * @fileoverview Root application component.
 * Provides the main layout structure with navigation, content outlet,
 * and toast notifications. Initializes socket connection on mount.
 * @module components/App
 */

import React, { ReactElement, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar2 } from "./shared/Navbar2";
import { ToastContainer } from "react-toastify";
import "../../app.css";
import { useStore } from "../store";

/**
 * Root application component that provides the main layout structure.
 *
 * Features:
 * - Initializes WebSocket connection to the server on mount
 * - Renders the navigation bar across all routes
 * - Provides React Router outlet for child routes
 * - Includes toast notification container for app-wide notifications
 *
 * @returns {ReactElement} The root application layout
 * @example
 * // Used as the root element in React Router configuration
 * const router = createBrowserRouter([
 *   {
 *     path: "/",
 *     element: <App />,
 *     children: [...]
 *   }
 * ]);
 */
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
