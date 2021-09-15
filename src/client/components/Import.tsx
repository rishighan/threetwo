import * as React from "react";
import { isUndefined } from "lodash";
import { connect } from "react-redux";
import { fetchComicBookMetadata } from "../actions/fileops.actions";
import { IFolderData } from "threetwo-ui-typings";
import DynamicList, { createCache } from "react-window-dynamic-list";
import toast, { Toaster } from "react-hot-toast";

interface IProps {
  matches: unknown;
  fetchComicMetadata: any;
  path: string;
  covers: any;
}
interface IState {
  folderWalkResults?: Array<IFolderData>;
  searchPaneIndex: number;
  fileOps: any;
}
class Import extends React.Component<IProps, IState> {
  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   * @beta
   */
  constructor(props: IProps) {
    super(props);
    this.state = {
      folderWalkResults: [],
      searchPaneIndex: 0,
      fileOps: [],
    };
  }

  public toggleSearchResultsPane(paneId: number): void {
    this.setState({
      searchPaneIndex: paneId,
    });
  }

  public initiateImport = () => {
    if (typeof this.props.path !== "undefined") {
      this.props.fetchComicMetadata();
      toast.custom(
        <div className="card">
          <div className="card-content">Saokaaate</div>
        </div>,
        {
          position: "top-right",
        },
      );
    }
  };

  public cache = createCache();

  public renderRow = ({ index, style }) => (
    <div style={style} className="min is-size-7">
      <span className="tag is-light">{index}</span>
      <div className="tags has-addons">
        <span className="tag is-success">cover</span>
        <span className="tag is-success is-light has-text-weight-medium">
          {this.props.covers[index].comicBookCoverMetadata.name}
        </span>
      </div>
      imported from
      <div className="tags has-addons">
        <span className="tag is-success">path</span>
        <span className="tag is-success is-light has-text-weight-medium">
          {this.props.covers[index].comicBookCoverMetadata.path}
        </span>
      </div>
      <div className="db-import-result-panel">
        <pre className="has-background-success-light">
          <span className="icon">
            <i className="fas fa-database"></i>
          </span>
          {JSON.stringify(this.props.covers[index].dbImportResult, null, 2)}
        </pre>
      </div>
    </div>
  );

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
                </span>
                will add comics identified from the mapped folder into the local
                db.
              </p>
              <p>
                <span className="tag is-medium is-info is-light">
                  Import and Tag
                </span>
                will scan the ComicVine, shortboxed APIs and import comics from
                the mapped folder with the additional metadata.
              </p>
            </div>
          </article>
          <Toaster />
          <p className="buttons">
            <button className="button is-medium" onClick={this.initiateImport}>
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

          {!isUndefined(this.state.folderWalkResults) ? <div></div> : null}
        </section>
      </div>
    );
  }
}

function mapStateToProps(state: IState) {
  console.log("state", state);
  return {
    // matches: state.comicInfo.searchResults,
    // covers: state.fileOps.comicBookMetadata,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchComicMetadata() {
    dispatch(fetchComicBookMetadata(ownProps.path));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Import);
