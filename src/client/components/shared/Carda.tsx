import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { isEmpty, isNil } from "lodash";

interface ICardProps {
  orientation: string;
  imageUrl?: string;
  hasDetails?: boolean;
  title?: PropTypes.ReactElementLike | null;
  children?: PropTypes.ReactNodeLike;
  borderColorClass?: string;
  backgroundColor?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  cardContainerStyle?: PropTypes.object;
  imageStyle?: PropTypes.object;
}

const renderCard = (props: ICardProps): ReactElement => {
  switch (props.orientation) {
    case "horizontal":
      return (
        <div className="card-container">
          <div className="card generic-card">
            <div className="is-horizontal">
              <div className="card-image">
                <img
                  style={props.imageStyle}
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
                  <img
                    src={props.imageUrl}
                    style={props.imageStyle}
                    alt="Placeholder image"
                  />
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

    case "vertical-2":
      return (
        <div className="block rounded-md w-fit h-fit shadow-md shadow-white-400 bg-gray-200 dark:bg-slate-500">
          <img
            alt="Home"
            src={props.imageUrl}
            className="rounded-t-md object-cover"
          />

          <div className="mt-2 px-2">
            <dl>
              <div>
                <dd className="text-md text-slate-500 dark:text-black">
                  {props.title}
                </dd>
              </div>
            </dl>

            {props.hasDetails && <>{props.children}</>}
          </div>
        </div>
      );

    case "horizontal-small":
      return (
        <>
          <div className="flex flex-row justify-start align-top gap-3 bg-slate-200 h-fit rounded-md shadow-md shadow-white-400">
            {/* thumbnail */}
            <div className="rounded-md overflow-hidden">
              <img src={props.imageUrl} className="object-cover h-20 w-20" />
            </div>
            {/* details */}
            <div className="w-fit h-fit pl-1 pr-2 py-1">
              <p className="text-sm">{props.title}</p>
            </div>
          </div>
        </>
      );

    case "horizontal-medium":
      return (
        <>
          <div className="flex flex-row items-center align-top gap-3 bg-slate-200 h-fit p-2 rounded-md shadow-md shadow-white-400">
            {/* thumbnail */}
            <div className="rounded-md overflow-hidden">
              <img src={props.imageUrl} />
            </div>
            {/* details */}
            <div className="pl-1 pr-2 py-1">
              <p className="text-sm">{props.title}</p>
              {props.hasDetails && <>{props.children}</>}
            </div>
          </div>
        </>
      );

    case "cover-only":
      return (
        <>
          {/* thumbnail */}
          <div className="rounded-lg overflow-hidden w-fit h-fit">
            <img src={props.imageUrl} />
          </div>
        </>
      );
    case "card-with-info-panel":
      return (
        <>
          <div className="flex flex-row">
            {/* thumbnail */}
            <div className="rounded-md overflow-hidden w-fit h-fit">
              <img src={props.imageUrl} />
            </div>
            {/* myata-dyata */}
          </div>
        </>
      );

    default:
      return <></>;
  }
};

export const Card = React.memo(
  (props: ICardProps): ReactElement => renderCard(props),
);

export default Card;
