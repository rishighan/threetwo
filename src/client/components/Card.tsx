import * as React from "react";
import { IExtractedComicBookCoverFile } from "../../server/interfaces/folder.interface";
import { map, isUndefined, isEmpty } from "lodash";

interface IProps {
  comicBookCoversMetadata: IExtractedComicBookCoverFile[];
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
    metadata: IExtractedComicBookCoverFile[],
  ): JSX.Element[] => {
    return map(metadata, (item: any, idx: number) => {
      return (
        <div key={idx}>
          <div className="card">
            <div className="is-horizontal">
              <div className="card-image">
                <figure className="image">
                  <img
                    src={
                      "http://localhost:3000" +
                      this.removeLeadingPeriod(
                        item.comicBookCoverMetadata.path,
                      ) +
                      "/" +
                      item.comicBookCoverMetadata.name
                    }
                    alt="Placeholder image"
                  />
                </figure>
              </div>
              <div className="card-content">
                <ul>
                  <li className="has-text-weight-semibold">
                    {item.comicBookCoverMetadata.name}
                  </li>
                  <li className="truncate">
                    {item.comicBookCoverMetadata.path}
                  </li>
                  <li className="status">
                    {item.dbImportResult.importStatus.isImported && (
                      <div className="tags has-addons">
                        <a className="tag">
                          <span className="icon has-text-success-dark">
                            <i className="fas fa-file-import"></i>
                          </span>
                        </a>
                        <span className="tag is-success">Imported</span>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  public render() {
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
