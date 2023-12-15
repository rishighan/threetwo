import React, { ReactElement } from "react";

export const AirDCPPSettingsConfirmation = (settingsObject): ReactElement => {
  const { settings } = settingsObject;
  return (
    <div>
      <span className="flex items-center mt-10 mb-4">
        <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
          AirDC++ Client Information
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
      </span>
      <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <span className="inline-flex justify-center rounded-full bg-emerald-100 mb-4 px-2 py-0.5 text-emerald-700">
          <span className="h-5 w-6">
            <i className="icon-[solar--plug-circle-bold] h-5 w-5"></i>
          </span>
          <p className="whitespace-nowrap text-sm">Connected</p>
        </span>
        <p className="font-hasklig text-sm text-gray-700 dark:text-gray-400">
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
        </p>
      </div>
    </div>
  );
};

export default AirDCPPSettingsConfirmation;
