import React, { useState, ReactElement } from "react";
import { AirDCPPSettingsForm } from "./AirDCPPSettings/AirDCPPSettingsForm";
import { AirDCPPHubsForm } from "./AirDCPPSettings/AirDCPPHubsForm";
import { QbittorrentConnectionForm } from "./QbittorrentSettings/QbittorrentConnectionForm";
import { SystemSettingsForm } from "./SystemSettings/SystemSettingsForm";
import { ServiceStatuses } from "../ServiceStatuses/ServiceStatuses";
import settingsObject from "../../constants/settings/settingsMenu.json";
import { isUndefined, map } from "lodash";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  const [active, setActive] = useState("gen-db");
  console.log(active);
  const settingsContent = [
    {
      id: "adc-hubs",
      content: (
        <div key="adc-hubs">
          <AirDCPPHubsForm />
        </div>
      ),
    },
    {
      id: "adc-connection",
      content: (
        <div key="adc-connection">
          <AirDCPPSettingsForm />
        </div>
      ),
    },
    {
      id: "qbt-connection",
      content: (
        <div key="qbt-connection">
          <QbittorrentConnectionForm />
        </div>
      ),
    },
    {
      id: "core-service",
      content: <>a</>,
    },
    {
      id: "flushdb",
      content: (
        <div key="flushdb">
          <SystemSettingsForm />
        </div>
      ),
    },
  ];
  return (
    <div>
      <section>
        <header className="bg-slate-200 dark:bg-slate-500">
          <div className="mx-auto max-w-screen-xl px-2 py-2 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Settings
                </h1>

                <p className="mt-1.5 text-sm text-gray-500 dark:text-white">
                  Import comics into the ThreeTwo library.
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-row">
          <div className="inset-y-0 w-80 dark:bg-gray-800 bg-slate-300 text-white overflow-y-auto">
            <aside className="px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
              {map(settingsObject, (settingObject, idx) => {
                return (
                  <div
                    className="w-64 py-2 text-slate-700 dark:text-slate-400"
                    key={idx}
                  >
                    <h3 className="text-l pb-2">
                      {settingObject.category.toUpperCase()}
                    </h3>
                    {/* First level children */}
                    {!isUndefined(settingObject.children) ? (
                      <ul key={settingObject.id}>
                        {map(settingObject.children, (item, idx) => {
                          return (
                            <li key={idx} className="mb-2">
                              <a
                                className={
                                  item.id.toString() === active
                                    ? "is-active flex items-center"
                                    : "flex items-center"
                                }
                                onClick={() => setActive(item.id.toString())}
                              >
                                {item.displayName}
                              </a>
                              {/* Second level children */}
                              {!isUndefined(item.children) ? (
                                <ul className="pl-4 mt-2">
                                  {map(item.children, (item, idx) => (
                                    <li key={item.id} className="mb-2">
                                      <a
                                        className={
                                          item.id.toString() === active
                                            ? "is-active flex items-center"
                                            : "flex items-center"
                                        }
                                        onClick={() =>
                                          setActive(item.id.toString())
                                        }
                                      >
                                        {item.displayName}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </aside>
          </div>

          {/* content for settings */}
          <div className="flex mx-12">
            <div className="">
              {map(settingsContent, ({ id, content }) =>
                active === id ? content : null,
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
