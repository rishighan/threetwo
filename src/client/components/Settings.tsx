import React, { useState, useEffect, useCallback, ReactElement } from "react";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  return (
    <section className="container">
      <div className="section">
        <h1 className="title">Settings</h1>
      </div>
    </section>
  );
};

export default Settings;
