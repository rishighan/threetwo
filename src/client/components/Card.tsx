import * as React from "react";
import { IExtractedComicBookCoverFile } from "threetwo-ui-typings";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../shared/utils/formatting.utils";
import { isUndefined, isEmpty } from "lodash";
import { Link } from "react-router-dom";
import ellipsize from "ellipsize";

interface IProps {
  comicBookCoversMetadata: IExtractedComicBookCoverFile;
  mongoObjId?: number;
}
interface IState {}

class Card extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public drawCoverCard = (
    metadata: IExtractedComicBookCoverFile,
  ): JSX.Element => {
    const filePath = encodeURI(
      "http://localhost:3000" +
        removeLeadingPeriod(metadata.path) +
        "/" +
        metadata.name,
    );

    return (
      <div>
        <div className="card generic-card">
          <div>
            <div className="card-image">
              <figure className="image">
                <img
                  src={escapePoundSymbol(filePath)}
                  alt="Placeholder image"
                />
              </figure>
            </div>
            <div className="card-content">
              <ul>
                <Link to={"/comic/details/" + this.props.mongoObjId}>
                  <li className="has-text-weight-semibold">
                    {ellipsize(metadata.name, 18)}
                  </li>
                </Link>
              </ul>
            </div>
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
