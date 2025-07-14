import React, { useState, ReactElement } from "react";
import { AirDCPPSettingsForm } from "./AirDCPPSettings/AirDCPPSettingsForm";
import { AirDCPPHubsForm } from "./AirDCPPSettings/AirDCPPHubsForm";
import { QbittorrentConnectionForm } from "./QbittorrentSettings/QbittorrentConnectionForm";
import { SystemSettingsForm } from "./SystemSettings/SystemSettingsForm";
import ProwlarrSettingsForm from "./ProwlarrSettings/ProwlarrSettingsForm";
import DockerVars from "./DockerVars/DockerVars";
import { ServiceStatuses } from "../ServiceStatuses/ServiceStatuses";
import settingsObject from "../../constants/settings/settingsMenu.json";
import { isUndefined, map } from "lodash";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  const [active, setActive] = useState("gen-db");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const settingsContent = [
    { id: "adc-hubs", content: <AirDCPPHubsForm /> },
    { id: "adc-connection", content: <AirDCPPSettingsForm /> },
    {id: "gen-docker-vars", content: <DockerVars />},
    { id: "qbt-connection", content: <QbittorrentConnectionForm /> },
    { id: "prwlr-connection", content: <ProwlarrSettingsForm /> },
    { id: "core-service", content: <>a</> },
    { id: "flushdb", content: <SystemSettingsForm /> },
  ];

  return (
    <div>
      <section>
        {/* Header */}
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-white">
                  Import comics into the ThreeTwo library.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex gap-8 px-12 py-6">
          {/* Sidebar */}
          <div className="relative z-30">
            <aside
              className="sticky top-6 w-72 max-h-[90vh]
             rounded-2xl shadow-xl backdrop-blur-md
             bg-white/70 dark:bg-slate-800/60
             border border-slate-200 dark:border-slate-700
             overflow-hidden"
            >
              <div className="px-4 py-6 overflow-y-auto">
                {map(settingsObject, (settingObject, idx) => (
                  <div
                    key={idx}
                    className="mb-6 text-slate-700 dark:text-slate-300"
                  >
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-3">
                      {settingObject.category.toUpperCase()}
                    </h3>

                    {!isUndefined(settingObject.children) && (
                      <ul>
                        {map(settingObject.children, (item, idx) => {
                          const isOpen = expanded[item.id];

                          return (
                            <li key={idx} className="mb-1">
                              <div
                                onClick={() => toggleExpanded(item.id)}
                                className={`cursor-pointer flex justify-between items-center px-1 py-1 rounded-md transition-colors hover:bg-white/50 dark:hover:bg-slate-700 ${
                                  item.id === active
                                    ? "font-semibold text-blue-600 dark:text-blue-400"
                                    : ""
                                }`}
                              >
                                <span
                                  onClick={() => setActive(item.id.toString())}
                                  className="flex-1"
                                >
                                  {item.displayName}
                                </span>
                                {!isUndefined(item.children) && (
                                  <span className="text-xs opacity-60">
                                    {isOpen ? "−" : "+"}
                                  </span>
                                )}
                              </div>

                              {!isUndefined(item.children) && isOpen && (
                                <ul className="pl-4 mt-1">
                                  {map(item.children, (subItem) => (
                                    <li key={subItem.id} className="mb-1">
                                      <a
                                        onClick={() =>
                                          setActive(subItem.id.toString())
                                        }
                                        className={`cursor-pointer flex items-center px-1 py-1 rounded-md transition-colors hover:bg-white/50 dark:hover:bg-slate-700 ${
                                          subItem.id.toString() === active
                                            ? "font-semibold text-blue-600 dark:text-blue-400"
                                            : ""
                                        }`}
                                      >
                                        {subItem.displayName}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {/* Content */}
          <main className="flex-1 px-2 py-2">
            {settingsContent.map(({ id, content }) =>
              active === id ? <div key={id}>{content}</div> : null,
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

export default Settings;
