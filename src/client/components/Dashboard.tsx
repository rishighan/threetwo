import * as React from "react";
import { connect } from "react-redux";
import ZeroState from "./ZeroState";
import { RecentlyImported } from "./RecentlyImported";
import { getComicBooks } from "../actions/fileops.actions";
import { isEmpty } from "lodash";

interface IProps {
  getRecentComics: Function;
  recentComics: any;
}
interface IState {
  fileOps: any;
}

class Dashboard extends React.Component<IProps, IState> {
  componentDidMount() {
    this.props.getRecentComics();
  }
  public render() {
    return (
      <div className="container">
        <section className="section">
          <h1 className="title">Dashboard</h1>

          {!isEmpty(this.props.recentComics) &&
          !isEmpty(this.props.recentComics.docs) ? (
            <>
              <h2 className="subtitle">Recently Imported</h2>
              <RecentlyImported comicBookCovers={this.props.recentComics} />
            </>
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
  return {
    recentComics: state.fileOps.recentComics,
  };
}

const mapDispatchToProps = (dispatch) => ({
  getRecentComics() {
    dispatch(
      getComicBooks({
        paginationOptions: {
          page: 0,
          limit: 5,
          sort: { updatedAt: "-1" },
        },
      }),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
