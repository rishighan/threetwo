import * as React from "react";
import ZeroState from "./ZeroState";

interface IProps {}
interface IState {}

class Dashboard extends React.Component<IProps, IState> {
  public render() {
    return (
      <div className="container">
        <section className="section">
          <h1 className="title">Dashboard</h1>
          <h2 className="subtitle">
            A simple container to divide your page into{" "}
            <strong>sections</strong>, like the one you're currently reading.
          </h2>
          <ZeroState
            header={"Set the source directory"}
            message={
              "No comics were found! Please point ThreeTwo! to a directory..."
            }
          />
        </section>
      </div>
    );
  }
}

export default Dashboard;
