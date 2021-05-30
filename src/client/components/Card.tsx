import * as React from "react";
import { IFolderData } from "../shared/interfaces/comicinfo.interfaces";
import { isArray, map, isUndefined, isEmpty, flatten } from "lodash";
import { socket } from "./Import";
import { walkFolder } from "../actions/fileops.actions";

interface IProps {
  comicBookCoversMetadata: any;
}
interface IState {}

class Card extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
  }
  private removeLeadingPeriod = (string) => {
    if (string.charAt(0) == ".") {
      string = string.substr(1);
    }
    return string;
  };
  public drawCoverCard = (metadata) => {
    return map(metadata, (item) => {
      return (
        <div className="card">
          <div className="card-image">
            <figure className="image">
              <img
                src={
                  "http://localhost:3000" +
                  this.removeLeadingPeriod(item.path) +
                  "/" +
                  item.name
                }
                alt="Placeholder image"
              />
            </figure>
          </div>
          <div className="card-content">
            <div className="content">{item.name}</div>
          </div>
        </div>
      );
    });
  };

  public render() {
    return <div>{this.drawCoverCard(this.props.comicBookCoversMetadata)}</div>;
  }
}

export default Card;
