import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import prettyBytes from "pretty-bytes";
import { Card } from "./Carda";
import { convert } from "html-to-text";
import { determineCoverFile } from "../../../shared/utils/metadata.utils";
import { isUndefined } from "lodash";

/**
 * Props for the {@link MetadataPanel} component.
 */
interface IMetadatPanelProps {
  /** Comic book record containing `rawFileDetails`, `inferredMetadata`, and `sourcedMetadata`. */
  data: any;
  /** Reserved for future use. */
  value?: any;
  /** Reserved for future use. */
  children?: any;
  /** Inline styles forwarded to the cover image. */
  imageStyle?: any;
  /** Inline styles forwarded to the title element (ComicVine panel only). */
  titleStyle?: any;
  /** Inline styles forwarded to the tags area. */
  tagsStyle?: any;
  /** Inline styles forwarded to the outer container. */
  containerStyle?: any;
  /** When `true`, renders a "missing file" visual state and warning icon. Defaults to `false`. */
  isMissing?: boolean;
}

/**
 * Small inline badge used to display file metadata (MIME type, file size, etc.).
 *
 * @param icon - Iconify/UnoCSS icon class string, e.g. `"icon-[solar--zip-file-bold-duotone]"`.
 * @param text - Label rendered beside the icon.
 */
const Badge = ({ icon, text }: { icon: string; text: React.ReactNode }) => (
  <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-1.5 sm:px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
    <span className="pr-1 pt-1">
      <i className={`${icon} w-4 h-4 sm:w-5 sm:h-5`} />
    </span>
    <span className="text-xs sm:text-md text-slate-500 dark:text-slate-900">{text}</span>
  </span>
);

/**
 * Displays a comic book's cover art alongside a contextual metadata panel.
 *
 * The panel content adapts based on the available metadata source:
 * - **`rawFileDetails`** — file-level info (name, series, issue number, MIME type, size).
 * - **`comicvine`** — enriched data from the ComicVine API (volume, description, year).
 * - **`locg`** — data from League of Comic Geeks (description, price, pulls, rating).
 *
 * The active panel is determined by {@link determineCoverFile}, which resolves
 * the best available cover and returns an `objectReference` key.
 *
 * @param props - See {@link IMetadatPanelProps}.
 * @returns A flex container with a cover card on the left and the metadata panel on the right.
 *
 * @example
 * ```tsx
 * <MetadataPanel data={comicRecord} isMissing={false} />
 * ```
 */
export const MetadataPanel = (props: IMetadatPanelProps): ReactElement => {
  const { isMissing = false } = props;
  const { rawFileDetails, inferredMetadata, sourcedMetadata: { comicvine, locg } } = props.data;
  const { issueName, url, objectReference } = determineCoverFile({ comicvine, locg, rawFileDetails });

  const panels: Record<string, () => ReactElement | false> = {
    rawFileDetails: () => (
      <dl className={`${isMissing ? "bg-card-missing dark:bg-card-missing" : "bg-card-imported dark:bg-card-imported"} dark:text-slate-800 p-2 sm:p-3 rounded-lg`}>
        <dt className="flex items-center gap-2">
          <p className="text-sm sm:text-lg">{issueName}</p>
        </dt>
        <dd className="text-xs sm:text-sm">
          is a part of{" "}
          <span className="underline">
            {inferredMetadata.issue.name}
            <i className="icon-[solar--arrow-right-up-outline] w-4 h-4" />
          </span>
        </dd>
        {inferredMetadata.issue.number && (
          <dd className="my-2">
            <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
              <span className="pr-1 pt-1">
                <i className="icon-[solar--hashtag-outline] w-3.5 h-3.5" />
              </span>
              <span className="text-xs sm:text-md text-slate-900 dark:text-slate-900">
                {inferredMetadata.issue.number}
              </span>
            </span>
          </dd>
        )}
        <dd className="flex flex-row flex-wrap gap-1 sm:gap-2 w-full sm:w-max">
          {rawFileDetails.mimeType && <Badge icon="icon-[solar--zip-file-bold-duotone]" text={rawFileDetails.mimeType} />}
          {rawFileDetails.fileSize != null && <Badge icon="icon-[solar--database-bold-duotone]" text={prettyBytes(rawFileDetails.fileSize)} />}
          {isMissing && (
            <span className="pr-2 pt-1" title="File backing this comic is missing">
              <i className="icon-[solar--file-corrupted-outline] w-5 h-5 text-red-600 shrink-0" />
            </span>
          )}
          {rawFileDetails.archive?.uncompressed && (
            <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
              <span className="pr-1 pt-1">
                <i className="icon-[solar--bookmark-bold-duotone] w-3.5 h-3.5" />
              </span>
            </span>
          )}
        </dd>
      </dl>
    ),

    comicvine: () =>
      !isUndefined(comicvine) &&
      !isUndefined(comicvine.volumeInformation) && (
        <dl>
          <dt>
            <h6 className="name has-text-weight-medium mb-1" style={props.titleStyle}>
              {ellipsize(issueName, 18)}
            </h6>
          </dt>
          <dd>
            <span className="is-size-7">
              Is a part of{" "}
              <span className="has-text-weight-semibold">{comicvine.volumeInformation.name}</span>
            </span>
          </dd>
          <dd className="is-size-7">
            <span>
              {ellipsize(convert(comicvine.description, { baseElements: { selectors: ["p"] } }), 120)}
            </span>
          </dd>
          <dd className="is-size-7 mt-2">
            <span className="my-3 mx-2">{comicvine.volumeInformation.start_year}</span>
            {comicvine.volumeInformation.count_of_issues} ComicVine ID {comicvine.id}
          </dd>
        </dl>
      ),

    locg: () => (
      <dl>
        <dt>
          <h6 className="name has-text-weight-medium mb-1">{ellipsize(issueName, 28)}</h6>
        </dt>
        <dd className="is-size-7">
          <span>{ellipsize(locg.description, 120)}</span>
        </dd>
        <dd className="is-size-7 mt-2">
          <div className="field is-grouped is-grouped-multiline">
            <div className="control">
              <span className="tags">
                <span className="tag is-success is-light has-text-weight-semibold">{locg.price}</span>
                <span className="tag is-success is-light">{locg.pulls}</span>
              </span>
            </div>
            <div className="control">
              <div className="tags has-addons">
                <span className="tag is-primary is-light">rating</span>
                <span className="tag is-info is-light">{locg.rating}</span>
              </div>
            </div>
          </div>
        </dd>
      </dl>
    ),
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 my-3">
      <div className="w-32 sm:w-56 lg:w-52 shrink-0">
        <Card imageUrl={url} orientation="cover-only" hasDetails={false} imageStyle={props.imageStyle} />
      </div>
      <div className="flex-1">{panels[objectReference]?.()}</div>
    </div>
  );
};

export default MetadataPanel;
