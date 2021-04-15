import * as React from "react";
import { hot } from "react-hot-loader";
import _ from "lodash";
import axios from "axios";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { comicinfoAPICall } from "../actions/comicinfo.actions";
import MatchResult from "./MatchResult";
import {
  IFolderData,
  IComicVineSearchMatch,
} from "../shared/interfaces/comicinfo.interfaces";
import { folderWalk } from "../shared/utils/folder.utils";
// import {} from "../constants/comicvine.mock";
import * as Comlink from "comlink";
import WorkerAdd from "../workers/extractCovers.worker";
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
      folderWalkResults: undefined,
      searchPaneIndex: undefined,
    };
  }

  public toggleSearchResultsPane(paneId: number): void {
    this.setState({
      searchPaneIndex: paneId,
    });
  }

  public async init() {
    // WebWorkers use `postMessage` and therefore work with Comlink.
    const { add } = Comlink.wrap(new WorkerAdd());
    const res = await add(1, 3);
    console.log(res);
  }

  public async startFolderWalk(): Promise<void> {
    this.init();
    const folderWalkResults = await folderWalk();
    this.setState({
      folderWalkResults,
    });
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
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Format</th>
                  <th>Is File</th>
                </tr>
                {!_.isUndefined(this.state.folderWalkResults) &&
                  this.state.folderWalkResults.map((result, idx) => (
                    <tr key={idx}>
                      <td>
                        {!result.isLink && !result.isFile ? (
                          <span className="icon-text">
                            <span className="icon">
                              <i className="fas fa-folder"></i>
                            </span>
                            <span>{result.name}</span>
                          </span>
                        ) : (
                          <span className="ml-5">{result.name}</span>
                        )}

                        {this.state.searchPaneIndex === idx &&
                        !_.isUndefined(this.props.matches) ? (
                          <MatchResult
                            queryData={result}
                            matchData={this.props.matches}
                            visible={true}
                          />
                        ) : null}
                      </td>
                      <td>
                        {!_.isEmpty(result.extension) ? (
                          <span className="tag is-info">
                            {result.extension}
                          </span>
                        ) : null}
                      </td>
                      <td>{result.isFile.toString()}</td>
                      <td>
                        <button
                          key={idx}
                          className="button is-small is-primary is-outlined"
                          onClick={(e) => {
                            this.props.findMatches(e, result);
                            this.toggleSearchResultsPane(idx);
                          }}
                        >
                          Find Match
                        </button>
                      </td>
                    </tr>
                  ))}
              </thead>
            </table>
          ) : null}
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    matches: state.comicInfo.searchResults,
  };
}

const mapDispatchToProps = (dispatch) => ({
  findMatches(e, results) {
    dispatch(
      comicinfoAPICall({
        callURIAction: "search",
        callMethod: "get",
        callParams: {
          format: "json",
          query: results.name,
          limit: 10,
          offset: 5,
          sort: "name:asc",
          resources: "issue",
        },
      }),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Import);
