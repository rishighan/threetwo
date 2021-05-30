import * as React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { fetchComicBookMetadata } from "../actions/fileops.actions";
import { IFolderData } from "../shared/interfaces/comicinfo.interfaces";
import Card from "./Card";
import { io } from "socket.io-client";

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
let socket;
class Import extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      folderWalkResults: [],
      searchPaneIndex: undefined,
    };
    socket = io("ws://localhost:3000/", {
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
      console.log(`connect ${socket.id}`);
    });
  }

  public toggleSearchResultsPane(paneId: number): void {
    this.setState({
      searchPaneIndex: paneId,
    });
  }

  public initiateSocketConnection = () => {
    if (typeof this.props.path !== "undefined") {
      this.props.fetchComicMetadata();
    }
  };

  public render() {
    return (
      <div>
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
          {/* Folder walk results */}
          {!_.isUndefined(this.state.folderWalkResults) ? (
            <>
              <div>poopie</div>
              <Card comicBookCoversMetadata={this.props.garam} />
            </>
          ) : null}
        </section>
      </div>
    );
  }
}

function mapStateToProps(state: IState) {
  console.log("STATE", state);
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
