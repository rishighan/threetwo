import React, { useContext } from "react";
import { SearchBar } from "./GlobalSearchBar/SearchBar";
import { DownloadProgressTick } from "./ComicDetail/DownloadProgressTick";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { isUndefined } from "lodash";

const Navbar: React.FunctionComponent = (props) => {
  const downloadProgressTick = useSelector(
    (state: RootState) => state.airdcpp.downloadProgressData,
  );

  // const airDCPPSocketConnectionStatus = useSelector((state: RootState) => {
  //   console.log(state);
  // });

  return (
    <nav className="navbar is-fixed-top">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img
            src="/img/threetwo.svg"
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

          <SearchBar />

          <Link to="/search" className="navbar-item">
            Search ComicVine
          </Link>
        </div>

        <div className="navbar-end">
          <a className="navbar-item is-hidden-desktop-only"></a>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link is-arrowless">
              <i className="fa-solid fa-download"></i>
              {downloadProgressTick && <div className="pulsating-circle"></div>}
            </a>
            {!isUndefined(downloadProgressTick) ? (
              <div className="navbar-dropdown download-progress-meter">
                <a className="navbar-item">
                  <DownloadProgressTick data={downloadProgressTick} />
                </a>
              </div>
            ) : null}
          </div>
          {/* AirDC++ socket connection status */}
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link is-arrowless has-text-success">
              <i className="fa-solid fa-bolt"></i>
            </a>
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
