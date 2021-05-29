import * as React from "react";
import { IFolderData } from "../shared/interfaces/comicinfo.interfaces";
import { isArray, map, isUndefined, isEmpty, flatten } from "lodash";
import { socket } from "./Import";
import { walkFolder } from "../actions/fileops.actions";

interface IProps {
  comicBookCoversMetadata: any;
}
interface IState {
  comicBookCoversMetadata: any[];
}

class Card extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      comicBookCoversMetadata: [],
    };
  }
  public fetchComicBookCoversData = (metadata) => {
    this.setState((prevState) => {
      // Get previous state
      const { comicBookCoversMetadata } = prevState;

      // Add new item to array
      comicBookCoversMetadata.push(metadata);

      // Return new state
      return { comicBookCoversMetadata };
    });
  };

  public drawCoverCard = () => {
    console.log("cover card", this.state.comicBookCoversMetadata);
    if (this.state.comicBookCoversMetadata.length >= 1) {
      return map(this.state.comicBookCoversMetadata, (metadata) => {
        return <div>{JSON.stringify(metadata)}</div>;
      });
    }
  };
  public async componentDidMount() {
    const extractionOptions = {
      sourceFolder: "./comics",
      extractTarget: "cover",
      targetExtractionFolder: "./userdata/covers",
      extractionMode: "bulk",
      paginationOptions: {
        pageLimit: 25,
        page: 1,
      },
    };
    const walkedFolders = await walkFolder("./comics");
    socket.emit("call", {
      action: "getComicCovers",
      params: {
        extractionOptions,
        walkedFolders,
      },
      opts: { garam: "pasha" },
    });
    socket.on("comicBookCoverMetadata", this.fetchComicBookCoversData);
  }
  public render() {
    return <div className="card">{this.drawCoverCard()}</div>;
  }
}

export default Card;
