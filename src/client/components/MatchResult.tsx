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
