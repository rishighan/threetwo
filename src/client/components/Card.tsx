import * as React from "react";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
import { map, isUndefined, isEmpty } from "lodash";

interface IProps {
  comicBookCoversMetadata: IExtractedComicBookCoverFile;
}
interface IState {}

class Card extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }
  private removeLeadingPeriod = (input: string): string => {
    if (!isUndefined(this.props.comicBookCoversMetadata)) {
      if (input.charAt(0) == ".") {
        input = input.substr(1);
      }
    }
    return input;
  };
  public drawCoverCard = (
    metadata: IExtractedComicBookCoverFile,
  ): JSX.Element => {
    return (
      <div>
        <div className="card">
          <div>
            <div className="card-image">
              <figure className="image">
                <img
                  src={
                    "http://localhost:3000" +
                    this.removeLeadingPeriod(metadata.path) +
                    "/" +
                    metadata.name
                  }
                  alt="Placeholder image"
                />
              </figure>
            </div>
            <div className="card-content">
              <ul>
                <li className="has-text-weight-semibold">{metadata.name}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  public render() {
    console.log(this.props.comicBookCoversMetadata);
    return (
      <>
        {!isUndefined(this.props.comicBookCoversMetadata) &&
          !isEmpty(this.props.comicBookCoversMetadata) &&
          this.drawCoverCard(this.props.comicBookCoversMetadata)}
      </>
    );
  }
}

export default Card;
