import React, { useState, useEffect, ReactElement, useContext } from "react";
import { AirDCPPSettingsForm } from "./AirDCPPSettings/AirDCPPSettingsForm";
import { AirDCPPHubsForm } from "./AirDCPPSettings/AirDCPPHubsForm";
import { SystemSettingsForm } from "./SystemSettings/SystemSettingsForm";
import settingsObject from "../constants/settings/settingsMenu.json";
import { isEmpty, isUndefined, map } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "../actions/settings.actions";
import { AirDCPPSocketContext } from "../context/AirDCPPSocket";
import AirDCPPSocket from "../services/DcppSearchService";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  // fetch saved AirDC++ settings, if any
  const airDCPPClientSettings = useSelector(
    (state: RootState) => state.settings.data,
  );
  const dispatch = useDispatch();
  const { ADCPPSocket, setADCPPSocket } = useContext(AirDCPPSocketContext);
  useEffect(() => {
    dispatch(getSettings());
  }, []);

  useEffect(() => {
    if (!isEmpty(airDCPPClientSettings)) {
      setADCPPSocket(
        new AirDCPPSocket({
          hostname: `${airDCPPClientSettings.directConnect.client.host.hostname}`,
          protocol: `${airDCPPClientSettings.directConnect.client.host.protocol}`,
        }),
      );
    }
  }, [airDCPPClientSettings]);
  const [active, setActive] = useState("gen-db");

  const settingsContent = [
    {
      id: "adc-hubs",
      content: (
        <>
          {!isEmpty(airDCPPClientSettings) ? (
            <AirDCPPHubsForm settings={airDCPPClientSettings} />
          ) : null}
        </>
      ),
    },
    {
      id: "adc-connection",
      content: (
        <>
          <AirDCPPSettingsForm settings={airDCPPClientSettings} />
        </>
      ),
    },
    {
      id: "flushdb",
      content: (
        <>
          <SystemSettingsForm settings={airDCPPClientSettings} />
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
                <div key={idx}>
                  <p className="menu-label">{settingObject.category}</p>
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
