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

  public drawCoverCard = (metadata) => {
    return map(metadata, (item) => {
      return <div className="card">{JSON.stringify(item)}</div>;
    });
  };

  public render() {
    return <div>{this.drawCoverCard(this.props.comicBookCoversMetadata)}</div>;
  }
}

export default Card;
