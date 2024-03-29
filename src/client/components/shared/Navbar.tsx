import React from "react";
import { SearchBar } from "../GlobalSearchBar/SearchBar";
import { DownloadProgressTick } from "../ComicDetail/DownloadProgressTick";
import { Link } from "react-router-dom";
import { isEmpty, isNil, isUndefined } from "lodash";
import { format, fromUnixTime } from "date-fns";
import { useStore } from "../../store/index";
import { useShallow } from "zustand/react/shallow";

const Navbar: React.FunctionComponent = (props) => {
  const {
    airDCPPSocketConnected,
    airDCPPDisconnectionInfo,
    airDCPPSessionInformation,
    airDCPPDownloadTick,
    importJobQueue,
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketConnected: state.airDCPPSocketConnected,
      airDCPPDisconnectionInfo: state.airDCPPDisconnectionInfo,
      airDCPPSessionInformation: state.airDCPPSessionInformation,
      airDCPPDownloadTick: state.airDCPPDownloadTick,
      importJobQueue: state.importJobQueue,
    })),
  );
  //   const downloadProgressTick = useSelector(
  //     (state: RootState) => state.airdcpp.downloadProgressData,
  //   );
  //
  //   const airDCPPSocketConnectionStatus = useSelector(
  //     (state: RootState) => state.airdcpp.isAirDCPPSocketConnected,
  //   );
  //   const airDCPPSessionInfo = useSelector(
  //     (state: RootState) => state.airdcpp.airDCPPSessionInfo,
  //   );
  //   const socketDisconnectionReason = useSelector(
  //     (state: RootState) => state.airdcpp.socketDisconnectionReason,
  //   );

  return (
    <nav className="navbar is-fixed-top">
      <div className="navbar-brand">
        <Link to="/dashboard" className="navbar-item">
          <img
            src="/src/client/assets/img/threetwo.svg"
            alt="ThreeTwo! A comic book curator"
            width="112"
            height="28"
          />
        </Link>

        <a className="navbar-item is-hidden-desktop">
          <span className="icon">
            <i className="fas fa-github"></i>
          </span>
        </a>

        <a className="navbar-item is-hidden-desktop">
          <span className="icon">
            <i className="fas fa-twitter"></i>
          </span>
        </a>

        <div className="navbar-burger burger" data-target="navMenubd-example">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navMenubd-example" className="navbar-menu">
        <div className="navbar-start">
          <Link to="/" className="navbar-item">
            Dashboard
          </Link>

          <Link to="/import" className="navbar-item">
            Import
          </Link>

          <Link to="/library" className="navbar-item">
            Library
          </Link>

          <Link to="/downloads" className="navbar-item">
            Downloads
          </Link>

          {/* <SearchBar /> */}

          <Link to="/search" className="navbar-item">
            Search ComicVine
          </Link>
        </div>

        <div className="navbar-end">
          <a className="navbar-item is-hidden-desktop-only"></a>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link is-arrowless">
              <i className="fa-solid fa-download"></i>
              {!isEmpty(airDCPPDownloadTick) && (
                <div className="pulsating-circle"></div>
              )}
            </a>
            {!isEmpty(airDCPPDownloadTick) ? (
              <div className="navbar-dropdown is-right is-boxed">
                <a className="navbar-item">
                  <DownloadProgressTick data={airDCPPDownloadTick} />
                </a>
              </div>
            ) : null}
          </div>

          {!isUndefined(importJobQueue.status) &&
          location.hash !== "#/import" ? (
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link is-arrowless">
                <i className="fa-solid fa-file-import has-text-warning-dark"></i>
              </a>

              <div className="navbar-dropdown is-right is-boxed">
                <a className="navbar-item">
                  <ul>
                    {importJobQueue.successfulJobCount > 0 ? (
                      <li className="mb-2">
                        <span className="tag is-success mr-2">
                          {importJobQueue.successfulJobCount}
                        </span>
                        imported.
                      </li>
                    ) : null}
                    {importJobQueue.failedJobCount > 0 ? (
                      <li>
                        <span className="tag is-danger mr-2">
                          {importJobQueue.failedJobCount}
                        </span>
                        failed to import.
                      </li>
                    ) : null}
                  </ul>
                </a>
              </div>
            </div>
          ) : null}

          {/* AirDC++ socket connection status */}
          <div className="navbar-item has-dropdown is-hoverable">
            {!isUndefined(airDCPPSessionInformation.user) ? (
              <>
                <a className="navbar-link is-arrowless has-text-success">
                  <i className="fa-solid fa-bolt"></i>
                </a>
                <div className="navbar-dropdown pr-2 pl-2 is-right airdcpp-status is-boxed">
                  {/* AirDC++ Session Information */}

                  <p>
                    Last login was{" "}
                    <span className="tag">
                      {format(
                        fromUnixTime(
                          airDCPPSessionInformation?.user.last_login,
                        ),
                        "dd MMMM, yyyy",
                      )}
                    </span>
                  </p>
                  <hr className="navbar-divider" />
                  <p>
                    <span className="tag has-text-success">
                      {airDCPPSessionInformation.user.username}
                    </span>
                    connected to{" "}
                    <span className="tag has-text-success">
                      {airDCPPSessionInformation.system_info.client_version}
                    </span>{" "}
                    with session ID{" "}
                    <span className="tag has-text-success">
                      {airDCPPSessionInformation.session_id}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <a className="navbar-link is-arrowless has-text-danger">
                  <i className="fa-solid fa-bolt"></i>
                </a>
                <div className="navbar-dropdown pr-2 pl-2 is-right is-boxed">
                  <pre>{JSON.stringify(airDCPPDisconnectionInfo, null, 2)}</pre>
                </div>
              </>
            )}
          </div>

          <div className="navbar-item has-dropdown is-hoverable is-mega">
            <div className="navbar-link flex">Blog</div>
            <div id="blogDropdown" className="navbar-dropdown">
              <div className="container is-fluid">
                <div className="columns">
                  <div className="column">
                    <h1 className="title is-6 is-mega-menu-title">
                      Sub Menu Title
                    </h1>
                    <a className="navbar-item" href="/2017/08/03/list-of-tags/">
                      <div className="navbar-content">
                        <p>
                          <small className="has-text-info">03 Aug 2017</small>
                        </p>
                        <p>New feature: list of tags</p>
                      </div>
                    </a>
                    <a className="navbar-item" href="/2017/08/03/list-of-tags/">
                      <div className="navbar-content">
                        <p>
                          <small className="has-text-info">03 Aug 2017</small>
                        </p>
                        <p>New feature: list of tags</p>
                      </div>
                    </a>
                    <a className="navbar-item" href="/2017/08/03/list-of-tags/">
                      <div className="navbar-content">
                        <p>
                          <small className="has-text-info">03 Aug 2017</small>
                        </p>
                        <p>New feature: list of tags</p>
                      </div>
                    </a>
                  </div>
                  <div className="column">
                    <h1 className="title is-6 is-mega-menu-title">
                      Sub Menu Title
                    </h1>

                    <a
                      className="navbar-item "
                      href="http://bulma.io/documentation/columns/basics/"
                    >
                      Columns
                    </a>
                  </div>
                  <div className="column">
                    <h1 className="title is-6 is-mega-menu-title">
                      Sub Menu Title
                    </h1>

                    <a className="navbar-item" href="/2017/08/03/list-of-tags/">
                      <div className="navbar-content">
                        <p>
                          <small className="has-text-info">03 Aug 2017</small>
                        </p>
                        <p>New feature: list of tags</p>
                      </div>
                    </a>
                  </div>
                  <div className="column">
                    <h1 className="title is-6 is-mega-menu-title">
                      Sub Menu Title
                    </h1>
                    <a
                      className="navbar-item "
                      href="/documentation/overview/start/"
                    >
                      Overview
                    </a>
                  </div>
                </div>
              </div>

              <hr className="navbar-divider" />
              <div className="navbar-item">
                <div className="navbar-content">
                  <div className="level is-mobile">
                    <div className="level-left">
                      <div className="level-item">
                        <strong>Stay up to date!</strong>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <a
                          className="button bd-is-rss is-small"
                          href="http://bulma.io/atom.xml"
                        >
                          <span className="icon is-small">
                            <i className="fa fa-rss"></i>
                          </span>
                          <span>Subscribe</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="navbar-item">
            <div className="field is-grouped">
              <p className="control">
                <Link to="/settings" className="navbar-item">
                  Settings
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
