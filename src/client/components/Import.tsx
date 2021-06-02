import * as React from "react";
import { isUndefined } from "lodash";
import { connect } from "react-redux";
import { fetchComicBookMetadata } from "../actions/fileops.actions";
import { IFolderData } from "../shared/interfaces/comicinfo.interfaces";
import Card from "./Card";
import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URI } from "../constants/endpoints";

interface IProps {
  matches: unknown;
  fetchComicMetadata: any;
  path: string;
  garam: any;
}
interface IState {
  folderWalkResults?: Array<IFolderData>;
  searchPaneIndex: number;
  fileOps: any;
}
let socket: Socket;
class Import extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      folderWalkResults: [],
      searchPaneIndex: undefined,
    };
  }

  public toggleSearchResultsPane(paneId: number): void {
    this.setState({
      searchPaneIndex: paneId,
    });
  }

  public initiateSocketConnection = () => {
    if (typeof this.props.path !== "undefined") {
      socket = io(SOCKET_BASE_URI, {
        reconnectionDelayMax: 10000,
      });

      socket.on("connect", () => {
        console.log(`connect ${socket.id}`);
      });
      this.props.fetchComicMetadata();
    }
  };

  public render() {
    return (
      <div className="container">
        <section className="section is-small">
          <h1 className="title">Import</h1>

          <article className="message is-dark">
            <div className="message-body">
              <p className="mb-2">
                <span className="tag is-medium is-info is-light">
                  Import Only
                </span>{" "}
                will add comics identified from the mapped folder into the local
                db.
              </p>
              <p>
                <span className="tag is-medium is-info is-light">
                  Import and Tag
                </span>{" "}
                will scan the ComicVine, shortboxed APIs and import comics from
                the mapped folder with the additional metadata.
              </p>
            </div>
          </article>
          <p className="buttons">
            <button
              className="button is-medium"
              onClick={this.initiateSocketConnection}
            >
              <span className="icon">
                <i className="fas fa-file-import"></i>
              </span>
              <span>Import Only</span>
            </button>

            <button className="button is-medium">
              <span className="icon">
                <i className="fas fa-tag"></i>
              </span>
              <span>Import and Tag</span>
            </button>
          </p>

          {!isUndefined(this.state.folderWalkResults) ? (
            <div className="card-container">
              <Card comicBookCoversMetadata={this.props.garam} />
            </div>
          ) : null}
        </section>
      </div>
    );
  }
}

function mapStateToProps(state: IState) {
  console.log("state", state);
  return {
    // matches: state.comicInfo.searchResults,
    garam: state.fileOps.comicBookMetadata,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchComicMetadata() {
    dispatch(fetchComicBookMetadata(ownProps.path));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Import);
export { socket };
