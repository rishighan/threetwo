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
        <div className="block rounded-md w-fit h-fit shadow-md shadow-white-800 bg-gray-200 dark:bg-slate-500">
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

              <div>
                <dt className="sr-only">Address</dt>
                <dd className="text-sm">
                  <span className="whitespace-nowrap rounded-md bg-purple-100 px-2.5 py-0.5 text-sm text-purple-700">
                    Live
                  </span>
                </dd>
              </div>
            </dl>

            <div className="flex flex-row items-center gap-4 my-2">
              <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
                <i className="h-7 w-7 icon-[solar--code-file-bold-duotone] text-orange-500 dark:text-orange"></i>

                {/* <div className="">
                  <p className="text-gray-500">Parking</p>
                  <p className="font-medium">2 spaces</p>
                </div> */}
              </div>

              <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2">
                <svg
                  className="h-4 w-4 text-indigo-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>

                {/* <div className="mt-1.5 sm:mt-0">
                  <p className="text-slate-500">Bathroom</p>
                  <p className="font-medium">2 rooms</p>
                </div> */}
              </div>

              <div className="sm:inline-flex sm:shrink-0 sm:items-center sm:gap-2"></div>
            </div>
          </div>
        </div>
      );
    default:
      return <></>;
  }
};

export const Card = React.memo(
  (props: ICardProps): ReactElement => renderCard(props),
);

export default Card;
