import React, { ReactElement } from "react";

export const AirDCPPSettingsConfirmation = (settingsObject): ReactElement => {
  const { settings } = settingsObject;
  return (
    <div className="mt-4 is-clearfix">
      <div className="card">
        <div className="card-content">
          <span className="icon is-medium is-pulled-right">
            <i className="fa-solid fa-circle has-text-success"></i>
          </span>
          <div className="content is-size-7">
            <dl>
              <dt>{settings._id}</dt>
              <dt>
                Client version:{" "}
                {
                  settings.directConnect.client.airdcppUserSettings.system_info
                    .client_version
                }
              </dt>
              <dt>
                Hostname:{" "}
                {
                  settings.directConnect.client.airdcppUserSettings.system_info
                    .hostname
                }
              </dt>
              <dt>
                Platform:{" "}
                {
                  settings.directConnect.client.airdcppUserSettings.system_info
                    .platform
                }
              </dt>

              <dt>
                Username:{" "}
                {
                  settings.directConnect.client.airdcppUserSettings.user
                    .username
                }
              </dt>

              <dt>
                Active Sessions:{" "}
                {
                  settings.directConnect.client.airdcppUserSettings.user
                    .active_sessions
                }
              </dt>
              <dt>
                Permissions:{" "}
                <pre>
                  {JSON.stringify(
                    settings.directConnect.client.airdcppUserSettings.user
                      .permissions,
                    undefined,
                    2,
                  )}
                </pre>
              </dt>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirDCPPSettingsConfirmation;
