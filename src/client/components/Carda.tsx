import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { isEmpty, isNil } from "lodash";

interface ICardProps {
  orientation: string;
  imageUrl: string;
  hasDetails: boolean;
  title?: PropTypes.ReactElementLike | null;
  children?: PropTypes.ReactNodeLike;
  borderColorClass?: string;
  backgroundColor?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  cardContainerStyle?: PropTypes.object;
}

const renderCard = (props): ReactElement => {
  switch (props.orientation) {
    case "horizontal":
      return (
        <div className="card-container">
          <div className="card generic-card">
            <div className="is-horizontal">
              <div className="card-image">
                <img
                  src={props.imageUrl}
                  alt="Placeholder image"
                  className="cropped-image"
                />
              </div>
              {props.hasDetails && (
                <div className="card-content">{props.children}</div>
              )}
            </div>
          </div>
        </div>
      );
    case "vertical":
      return (
        <div onClick={props.onClick}>
          <div className="generic-card" style={props.cardContainerStyle}>
            <div
              className={
                !isNil(props.borderColorClass)
                  ? `${props.borderColorClass}`
                  : ""
              }
            >
              <div
                className={
                  props.hasDetails
                    ? "partial-rounded-card-image"
                    : "rounded-card-image"
                }
              >
                <figure>
                  <img src={props.imageUrl} alt="Placeholder image" />
                </figure>
              </div>
              {props.hasDetails && (
                <div
                  className="card-content"
                  style={{ backgroundColor: props.backgroundColor }}
                >
                  {!isNil(props.title) ? (
                    <div className="card-title is-size-8 is-family-secondary">
                      {props.title}
                    </div>
                  ) : null}
                  {props.children}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    default:
      return <></>;
  }
};

export const Card = (props: ICardProps): ReactElement => {
  return renderCard(props);
};

export default Card;
