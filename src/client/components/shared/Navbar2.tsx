import React, { ReactElement, useState } from "react";
import { Link } from "react-router";
import { useDarkMode } from "../../hooks/useDarkMode";

export const Navbar2 = (): ReactElement => {
  const [colorTheme, setTheme] = useDarkMode();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = (checked) => {
    setTheme(colorTheme);
    setDarkMode(!darkMode);
  };

  return (
    <header className="bg-white dark:bg-gray-900 gap-8 px-5 py-5 h-18 border-b-2 border-gray-300 dark:border-slate-200">
      {/* Logo */}
      <div className="mx-auto flex">
        <img src="/src/client/assets/img/threetwo.png" alt="ThreeTwo!" />

        {/* Main Navigation */}
        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav
            aria-label="ThreeTwo Main Navigation"
            className="hidden md:block"
          >
            <ul className="flex items-center gap-6 text-md">
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/import"
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  Import
                </Link>
              </li>

              <li>
                <Link
                  to="/library"
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  Library
                </Link>
              </li>

              <li>
                <Link
                  to="/volumes"
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  Volumes
                </Link>
              </li>

              <li>
                <a
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/"
                >
                  Downloads
                </a>
              </li>
              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  to="/search"
                >
                  Comicvine Search
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right-most Nav */}
          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-6 text-md">
              {/* Settings Icon and text */}
              <li>
                <Link
                  to="/settings"
                  className="flex items-center space-x-1 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  <span className="w-5 h-5">
                    <i className="icon-[solar--settings-outline] h-5 w-5"></i>
                  </span>
                  <span>Settings</span>
                </Link>
              </li>

              <li>
                {/* Light/Dark Mode toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-white">Dark</span>
                  <label
                    htmlFor="toggle"
                    className="relative inline-flex items-center"
                  >
                    <input
                      type="checkbox"
                      id="toggle"
                      className="sr-only"
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                    <span className="bg-gray-300 w-10 h-6 rounded-full"></span>
                    <span
                      className={`bg-white w-4 h-4 rounded-full absolute left-1 top-1 transition-transform duration-300 ease-in-out ${
                        darkMode ? "translate-x-4" : ""
                      }`}
                    ></span>
                  </label>
                  <span className="text-gray-600 dark:text-white">Light</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
