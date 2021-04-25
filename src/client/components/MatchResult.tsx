import * as React from "react";
import {
  IComicVineSearchMatch,
  IFolderData,
} from "../shared/interfaces/comicinfo.interfaces";
import _ from "lodash";
import { autoMatcher } from "../shared/utils/query.transformer";

interface IProps {
  matchData: unknown;
  visible: boolean;
  queryData: IFolderData;
}

interface IState {}

class MatchResult extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public componentDidMount() {
    console.log(this.props);
    autoMatcher(this.props.queryData, this.props.matchData.results);
  }

  public render() {
    {
      /* 
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
    */
    }
    return this.props.visible ? (
      <div>
        <h3>Matches</h3>
        <div className="search-results-container">
          {this.props.matchData.results.map((result, idx) => {
            return (
              <div key={idx} className="search-result">
                <img className="cover-image" src={result.image.thumb_url} />
                <div className="search-result-details">
                  <h5>{result.volume.name}</h5>

                  {!_.isEmpty(result.extension) ? (
                    <span className="tag is-info">{result.extension}</span>
                  ) : null}

                  <span className="tag is-info">
                    Issue Number: {result.issue_number}
                  </span>
                  <p>{result.site_detail_url}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null;
  }
}

export default MatchResult;
