import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { isEmpty, isNil } from "lodash";

interface ICardProps {
  orientation: string;
  imageUrl: string;
  hasDetails: boolean;
  title?: PropTypes.ReactElementLike | null;
  children?: PropTypes.ReactNodeLike;
}

const renderCard = (props): ReactElement => {
  switch (props.orientation) {
    case "horizontal":
      return <>horiztonal</>;
    case "vertical":
      return (
        <div>
          <div className="generic-card">
            <div>
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
                <div className="card-content">
                  <div className="card-title is-size-6 is-family-secondary">
                    {isNil(props.title) ? "No Name" : props.title}
                  </div>
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
