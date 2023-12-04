import React, { ReactElement } from "react";

export const Navbar2 = (): ReactElement => {
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
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-1 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                >
                  <span>
                    <span>
                      <i className="icon-[solar--settings-outline] h-5 w-5"></i>
                    </span>
                  </span>
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
