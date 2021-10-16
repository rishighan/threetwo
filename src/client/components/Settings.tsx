import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { AirDCPPSettingsForm } from "./AirDCPPSettingsForm";
import settingsObject from "../constants/settings/settingsMenu.json";
import { isUndefined, map } from "lodash";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  const [active, setActive] = useState("gen-db");
  const settingsContent = [
    {
      id: "adc-connection",
      content: (
        <>
          <div className="content">
            <p>
              <h3 className="title">AirDC++ Connection Settings</h3>
              <h6 className="subtitle has-text-grey-light">
                Configure AirDC++ connection settings such as hostname and
                credentials
              </h6>
            </p>
          </div>
        </>
      ),
    },
    {
      id: "adc-hubs",
      content: (
        <>
          <AirDCPPSettingsForm />
        </>
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
                <>
                  <p className="menu-label" key={idx}>
                    {settingObject.category}
                  </p>
                  {/* First level children */}
                  {!isUndefined(settingObject.children) ? (
                    <ul className="menu-list" key={settingObject.id}>
                      {map(settingObject.children, (item, idx) => {
                        return (
                          <li key={item.id}>
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
                </>
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
