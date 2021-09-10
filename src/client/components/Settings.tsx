import React, { useState, useEffect, useCallback, ReactElement } from "react";

interface ISettingsProps {}

export const Settings = (props: ISettingsProps): ReactElement => {
  return (
    <section className="container">
      <div className="columns">
        <div className="section column is-one-quarter">
          <h1 className="title">Settings</h1>
          <aside className="menu">
            <p className="menu-label">General</p>
            <ul className="menu-list">
              <li>
                <a>Dashboard</a>
              </li>
              <li>
                <a>Global Search</a>
              </li>
            </ul>
            <p className="menu-label">Acquisition</p>
            <ul className="menu-list">
              <li>
                <a className="is-active">AirDC++</a>
                <ul>
                  <li>
                    <a>Connection</a>
                  </li>
                  <li>
                    <a>Hubs</a>
                  </li>
                  <li>
                    <a>Additional Configuration</a>
                  </li>
                </ul>
              </li>
            </ul>
            <p className="menu-label">ComicVine</p>
            <ul className="menu-list">
              <li>
                <a>API</a>
              </li>
              <li>
                <a>Configuration</a>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Settings;
