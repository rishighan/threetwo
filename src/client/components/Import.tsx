import * as React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import main from "../workers/extractCovers.worker";
interface IProps {
  matches: unknown;
}
interface IState {
  folderWalkResults?: Array<IFolderData>;
  searchPaneIndex: number;
}

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

  public async startFolderWalk() {
    const foo = await main();
    console.log("as", foo);
  }
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
              onClick={() => this.startFolderWalk()}
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
            </>
          ) : null}
        </section>
      </div>
    );
  }
}

function mapStateToProps(state: IState) {
  return {
    // matches: state.comicInfo.searchResults,
  };
}

const mapDispatchToProps = (dispatch) => ({
  name: "rishi",
});

export default connect(mapStateToProps, mapDispatchToProps)(Import);
