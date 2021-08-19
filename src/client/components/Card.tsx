import * as React from "react";
import { IExtractedComicBookCoverFile } from "threetwo-ui-typings";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { isUndefined, isEmpty, isNil } from "lodash";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";

interface IProps {
  comicBookCoversMetadata?: IExtractedComicBookCoverFile;
  mongoObjId?: number;
  hasTitle: boolean;
  title?: string;
  isHorizontal: boolean;
}
interface IState {}

class Card extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public drawCoverCard = (
    metadata: IExtractedComicBookCoverFile,
  ): JSX.Element => {
    const encodedFilePath = encodeURI(
      "http://localhost:3000" + removeLeadingPeriod(metadata.path),
    );
    const filePath = escapePoundSymbol(encodedFilePath);
    return (
      <div>
        <div className="card generic-card">
          <div className={this.props.isHorizontal ? "is-horizontal" : ""}>
            <div className="card-image">
              <figure className="image">
                <img src={filePath} alt="Placeholder image" />
              </figure>
            </div>
            {this.props.hasTitle && (
              <div className="card-content">
                <ul>
                  <Link to={"/comic/details/" + this.props.mongoObjId}>
                    <li className="has-text-weight-semibold">
                      {ellipsize(metadata.name, 18)}
                    </li>
                  </Link>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
