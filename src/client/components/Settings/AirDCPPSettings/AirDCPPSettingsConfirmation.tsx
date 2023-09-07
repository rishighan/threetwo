import React, { ReactElement } from "react";

export const AirDCPPSettingsConfirmation = (settingsObject): ReactElement => {
  const { settings } = settingsObject;
  console.log(settings);
  return (
    <div className="mt-4 is-clearfix">
      <div className="card">
        <div className="card-content">
          <span className="tag is-pulled-right is-primary">Connected</span>
          <div className="content is-size-7">
            <dl>
              <dt>{settings._id}</dt>
              <dt>Client version: {settings.system_info.client_version}</dt>
              <dt>Hostname: {settings.system_info.hostname}</dt>
              <dt>Platform: {settings.system_info.platform}</dt>

              <dt>Username: {settings.user.username}</dt>

              <dt>Active Sessions: {settings.user.active_sessions}</dt>
              <dt>
                Permissions:{" "}
                <pre>
                  {JSON.stringify(settings.user.permissions, undefined, 2)}
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
