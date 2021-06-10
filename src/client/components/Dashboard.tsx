import * as React from "react";
import { connect } from "react-redux";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { getRecentlyImportedComicBooks } from "../actions/fileops.actions";
import { isUndefined } from "lodash";

interface IProps {
  getRecentComics: Function;
  recentComics: any;
}
interface IState {
  fileOps: any;
}

class Dashboard extends React.Component<IProps, IState> {
  componentDidMount() {
    if (!isUndefined(this.props.recentComics)) {
      console.log("asd");
    }
    this.props.getRecentComics();
  }
  public render() {
    return (
      <div className="container">
        <section className="section">
          <h1 className="title">Dashboard</h1>
          <h2 className="subtitle">Recently Imported</h2>
          {this.props.recentComics ? (
            <RecentlyImported comicBookCovers={this.props.recentComics} />
          ) : (
            <ZeroState
              header={"Set the source directory"}
              message={
                "No comics were found! Please point ThreeTwo! to a directory..."
              }
            />
          )}
        </section>
      </div>
    );
  }
}

function mapStateToProps(state: IState) {
  console.log("state", state);
  return {
    recentComics: state.fileOps.recentComics,
  };
}

const mapDispatchToProps = (dispatch) => ({
  getRecentComics() {
    dispatch(
      getRecentlyImportedComicBooks({
        paginationOptions: {
          page: 0,
          limit: 5,
        },
      }),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
