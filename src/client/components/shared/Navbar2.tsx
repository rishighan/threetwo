import React, { ReactElement, useState } from "react";

export const Navbar2 = (): ReactElement => {
  const [isLightMode, setIsLightMode] = useState(false);

  const handleToggle = () => {
    setIsLightMode(!isLightMode);
    // Add your code for enabling dark/light mode here
  };

  return (
    <header className="dark:bg-gray h-18 bg-white gap-8 px-5 py-5 border-b-2">
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
                <a
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/"
                >
                  Dashboard
                </a>
              </li>

              <li>
                <a
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/"
                >
                  Import
                </a>
              </li>

              <li>
                <a
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/"
                >
                  Library
                </a>
              </li>

              <li>
                <a
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/"
                >
                  Volumes
                </a>
              </li>

              <li>
                <a
                  className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                  href="/"
                >
                  Downloads
                </a>
              </li>
            </ul>
          </nav>

          {/* Right-most Nav */}
          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-6 text-md">
              {/* Settings Icon and text */}
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-1 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  <span className="w-5 h-6">
                    <span>
                      <i className="icon-[solar--settings-outline] h-5 w-5"></i>
                    </span>
                  </span>
                  <span>Settings</span>
                </a>
              </li>

              <li>
                {/* Light/Dark Mode toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Dark Mode</span>
                  <label
                    htmlFor="toggle"
                    className="relative inline-flex items-center"
                  >
                    <input
                      type="checkbox"
                      id="toggle"
                      className="sr-only"
                      checked={isLightMode}
                      onChange={handleToggle}
                    />
                    <span className="bg-gray-300 w-10 h-6 rounded-full"></span>
                    <span
                      className={`bg-white w-4 h-4 rounded-full absolute left-1 top-1 transition-transform duration-300 ease-in-out ${
                        isLightMode ? "translate-x-4" : ""
                      }`}
                    ></span>
                  </label>
                  <span className="text-gray-600">Light Mode</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
