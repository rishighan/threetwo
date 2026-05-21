/**
 * @fileoverview Card component with multiple orientation and styling options for displaying content.
 * Provides various layout modes including vertical, horizontal, and specialized variants with state indicators.
 * @module components/shared/Carda
 */

import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { isEmpty, isNil } from "lodash";

/**
 * Props interface for the Card component.
 * Defines all configurable properties for rendering cards in different orientations and states.
 *
 * @interface ICardProps
 * @property {string} orientation - Card layout orientation. Options: "horizontal", "vertical", "vertical-2", "horizontal-small", "horizontal-medium", "cover-only", "card-with-info-panel"
 * @property {string} [imageUrl] - URL of the image to display in the card
 * @property {boolean} [hasDetails] - Whether to render the details/content section of the card
 * @property {React.ReactNode} [title] - Title content to display in the card header
 * @property {React.ReactNode} [children] - Child components to render in the card's content area
 * @property {string} [borderColorClass] - CSS class name for custom border color styling
 * @property {string} [backgroundColor] - Background color for the card content area
 * @property {"wanted"|"delete"|"scraped"|"uncompressed"|"imported"|"missing"} [cardState] - Visual state indicator for the card
 * @property {(event: React.MouseEvent<HTMLElement>) => void} [onClick] - Click event handler for the card
 * @property {React.CSSProperties} [cardContainerStyle] - Custom inline styles for the card container
 * @property {React.CSSProperties} [imageStyle] - Custom inline styles for the card image
 */
interface ICardProps {
  orientation: string;
  imageUrl?: string;
  hasDetails?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  borderColorClass?: string;
  backgroundColor?: string;
  cardState?: "wanted" | "delete" | "scraped" | "uncompressed" | "imported" | "missing";
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  cardContainerStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}

/**
 * Maps a card state string to its corresponding Tailwind CSS background class.
 * Used to apply visual indicators based on the card's current state.
 *
 * @param {string} [cardState] - The state of the card
 * @returns {string} The corresponding CSS class name, or empty string if no state is provided
 * @example
 * getCardStateClass("wanted") // returns "bg-card-wanted"
 * getCardStateClass("missing") // returns "bg-card-missing"
 * getCardStateClass() // returns ""
 */
const getCardStateClass = (cardState?: string): string => {
  switch (cardState) {
    case "wanted":
      return "bg-card-wanted";
    case "delete":
      return "bg-card-delete";
    case "scraped":
      return "bg-card-scraped";
    case "uncompressed":
      return "bg-card-uncompressed";
    case "imported":
      return "bg-card-imported";
    case "missing":
      return "bg-card-missing";
    default:
      return "";
  }
};

/**
 * Renders a card component based on the specified orientation and props.
 * Supports multiple card layouts including horizontal, vertical, and specialized variants.
 * Each orientation provides a different visual layout optimized for specific use cases.
 *
 * @param {ICardProps} props - The card component properties
 * @returns {ReactElement} The rendered card component
 * @example
 * // Vertical card with image and title
 * renderCard({
 *   orientation: "vertical-2",
 *   imageUrl: "/images/cover.jpg",
 *   title: "Batman #42",
 *   hasDetails: true,
 *   children: <div>Comic details</div>
 * })
 *
 * @example
 * // Horizontal small card
 * renderCard({
 *   orientation: "horizontal-small",
 *   imageUrl: "/images/thumb.jpg",
 *   title: "Spider-Man #1"
 * })
 */
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
        <div className={`block rounded-md max-w-64 h-fit shadow-md shadow-white-400 ${getCardStateClass(props.cardState) || "bg-gray-200 dark:bg-slate-500"}`}>
          <div className="relative">
            {props.imageUrl ? (
              <img
                alt="Home"
                src={props.imageUrl}
                className="rounded-t-md object-cover"
              />
            ) : (
              <div className="rounded-t-md h-48 bg-gray-100 dark:bg-slate-600" />
            )}
            {props.cardState === "missing" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-t-md bg-card-missing/70">
                <i className="icon-[solar--file-corrupted-outline] w-16 h-16 text-red-500" />
              </div>
            )}
          </div>

          {props.title ? (
            <div className="px-3 pt-3 mb-2">
              <dd className="text-sm text-slate-500 dark:text-black">
                {props.title}
              </dd>
            </div>
          ) : null}

          {props.hasDetails ? (
            <div className="px-2">
              <>{props.children}</>
            </div>
          ) : null}
        </div>
      );

    case "horizontal-small":
      return (
        <>
          <div className={`flex flex-row justify-start align-top gap-3 h-fit rounded-md shadow-md shadow-white-400 ${getCardStateClass(props.cardState) || "bg-slate-200"}`}>
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
          <div className={`flex flex-row items-center align-top gap-3 h-fit p-2 rounded-md shadow-md shadow-white-400 ${getCardStateClass(props.cardState) || "bg-slate-200"}`}>
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
          <div className="rounded-lg shadow-lg overflow-hidden w-fit h-fit">
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

/**
 * A memoized card component that renders various card layouts based on orientation.
 * This component is optimized with React.memo to prevent unnecessary re-renders when props haven't changed.
 * Supports multiple orientations including horizontal, vertical, and specialized variants with state indicators.
 *
 * @component
 * @param {ICardProps} props - The card component properties
 * @returns {ReactElement} The memoized card component
 * @example
 * // Basic vertical card
 * <Card
 *   orientation="vertical-2"
 *   imageUrl="/images/comic-cover.jpg"
 *   title="Batman #42"
 *   hasDetails={true}
 * >
 *   <div>Additional comic details</div>
 * </Card>
 *
 * @example
 * // Horizontal small card with state
 * <Card
 *   orientation="horizontal-small"
 *   imageUrl="/images/thumb.jpg"
 *   title="Spider-Man #1"
 *   cardState="wanted"
 * />
 *
 * @example
 * // Card with click handler
 * <Card
 *   orientation="vertical"
 *   imageUrl="/images/cover.jpg"
 *   title="X-Men #1"
 *   onClick={(e) => handleCardClick(e)}
 * />
 */
export const Card = React.memo(
  (props: ICardProps): ReactElement => renderCard(props),
);

export default Card;
