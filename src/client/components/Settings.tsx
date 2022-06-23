import React, { useState, ReactElement } from "react";
import { AirDCPPSettingsForm } from "./AirDCPPSettings/AirDCPPSettingsForm";
import { AirDCPPHubsForm } from "./AirDCPPSettings/AirDCPPHubsForm";
import { SystemSettingsForm } from "./SystemSettings/SystemSettingsForm";
import settingsObject from "../constants/settings/settingsMenu.json";
import { isUndefined, map } from "lodash";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  const [active, setActive] = useState("gen-db");
  const settingsContent = [
    {
      id: "adc-hubs",
      content: <div key="adc-hubs">{<AirDCPPHubsForm />}</div>,
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
      id: "flushdb",
      content: (
        <div key="flushdb">
          <SystemSettingsForm />
        </div>
      ),
    },
  ];
  return (
    <section className="container">
      <div className="columns">
        <div className="section column is-one-quarter">
          <h1 className="title">Settings</h1>
          <aside className="menu">
            {map(settingsObject, (settingObject, idx) => {
              return (
                <div key={idx}>
                  <p className="menu-label">{settingObject.category}</p>
                  {/* First level children */}
                  {!isUndefined(settingObject.children) ? (
                    <ul className="menu-list" key={settingObject.id}>
                      {map(settingObject.children, (item, idx) => {
                        return (
                          <li key={idx}>
                            <a
                              className={
                                item.id.toString() === active ? "is-active" : ""
                              }
                              onClick={() => setActive(item.id.toString())}
                            >
                              {item.displayName}
                            </a>
                            {/* Second level children */}
                            {!isUndefined(item.children) ? (
                              <ul>
                                {map(item.children, (item, idx) => (
                                  <li key={item.id}>
                                    <a
                                      className={
                                        item.id.toString() === active
                                          ? "is-active"
                                          : ""
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
        <div className="section column is-half mt-6">
          <div className="content">
            {map(settingsContent, ({ id, content }) =>
              active === id ? content : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
