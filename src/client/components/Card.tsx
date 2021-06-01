import * as React from "react";

import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
import { map } from "lodash";

interface IProps {
  comicBookCoversMetadata: IExtractedComicBookCoverFile[];
}
interface IState {}

class Card extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }
  private removeLeadingPeriod = (input: string): string => {
    if (input.charAt(0) == ".") {
      input = input.substr(1);
    }
    return input;
  };
  public drawCoverCard = (
    metadata: IExtractedComicBookCoverFile[],
  ): JSX.Element[] => {
    return map(metadata, (item: IExtractedComicBookCoverFile) => {
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
            <div className="content truncate">{item.name}</div>
          </div>
        </div>
      );
    });
  };

  public render() {
    return <>{this.drawCoverCard(this.props.comicBookCoversMetadata)}</>;
  }
}

export default Card;
