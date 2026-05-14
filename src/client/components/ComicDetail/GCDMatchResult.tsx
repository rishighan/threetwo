import React from "react";
import { isNil, map } from "lodash";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { useGetComicByIdQuery } from "../../graphql/generated";
import type { ScoredGCDMatch } from "../../graphql/gcd.types";
import type { QueryClient } from "@tanstack/react-query";

const handleBrokenImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = "http://localhost:3050/dist/img/noimage.svg";
};

interface GCDMatchResultProps {
  matchData: ScoredGCDMatch[];
  comicObjectId: string;
  queryClient?: QueryClient;
  onMatchApplied?: () => void;
}

/**
 * GraphQL mutation for applying GCD metadata to a comic
 */
const APPLY_GCD_METADATA_MUTATION = `
  mutation ApplyGCDMetadata($input: ApplyGCDMetadataInput!) {
    applyGCDMetadata(input: $input) {
      success
      message
      comicObjectId
      updatedAt
    }
  }
`;

/**
 * Displays individual GCD (Grand Comics Database) match results with issue and series information.
 * Each match card shows the issue cover, metadata, series info, match score,
 * and an Apply Match button to save the metadata to the comic.
 * 
 * Note: GCD schema uses camelCase field names (e.g., publicationDate, yearBegan).
 */
export const GCDMatchResult = (props: GCDMatchResultProps) => {
  /**
   * Applies the selected GCD match to the comic document.
   * Calls the GraphQL mutation to update sourcedMetadata.gcd.
   */
  const applyGCDMatch = async (match: ScoredGCDMatch, comicObjectId: string) => {
    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: APPLY_GCD_METADATA_MUTATION,
          variables: {
            input: {
              comicObjectId,
              gcdIssueId: match.issue.id,
              gcdSeriesId: match.series.id,
            },
          },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        console.error("GraphQL errors:", json.errors);
        throw new Error(json.errors[0]?.message || "Failed to apply GCD metadata");
      }

      // Invalidate and refetch the comic book metadata
      if (props.queryClient) {
        await props.queryClient.invalidateQueries({
          queryKey: useGetComicByIdQuery.getKey({ id: comicObjectId }),
        });
      }

      // Call the callback to close panel and switch tabs
      if (props.onMatchApplied) {
        props.onMatchApplied();
      }

      return json.data?.applyGCDMetadata;
    } catch (error) {
      console.error("Error applying GCD match:", error);
      throw error;
    }
  };

  return (
    <>
      <span className="flex items-center mt-6">
        <span className="text-md text-slate-500 dark:text-slate-500 pr-5">
          GCD Matches
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
      </span>
      {map(props.matchData, (match, idx) => {
        // Parse issue notes if available as description
        let issueDescription = "";
        if (!isNil(match.issue.notes)) {
          issueDescription = convert(match.issue.notes, {
            baseElements: {
              selectors: ["p"],
            },
          });
        }

        // Highlight best match with green background
        const bestMatchCSSClass = idx === 0 ? "bg-green-100 dark:bg-green-900" : "bg-slate-300 dark:bg-slate-700";

        return (
          <div className={`${bestMatchCSSClass} my-5 p-4 rounded-lg`} key={idx}>
            <div className="flex flex-row gap-4">
              {/* Issue cover image - GCD doesn't have cover URLs, use placeholder */}
              <div className="min-w-fit">
                <div className="w-24 h-36 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center">
                  <i className="icon-[solar--gallery-wide-line-duotone] w-8 h-8 text-slate-400"></i>
                </div>
              </div>

              <div className="flex-1">
                {/* Issue title and score row - use series name since issue doesn't have title */}
                <div className="flex flex-row mb-1 justify-between">
                  <p className="text-md font-medium dark:text-slate-100">{match.series.name}</p>

                  {/* Match score badge */}
                  <span className="inline-flex h-fit w-fit items-center bg-green-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-green-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--course-up-line-duotone] w-4 h-4"></i>
                    </span>
                    <span className="text-slate-900 dark:text-slate-900">
                      {Math.round(match.score)}
                    </span>
                  </span>
                </div>

                {/* Issue metadata badges */}
                <span className="flex flex-row gap-2 mb-2 flex-wrap">
                  {/* Issue number */}
                  {match.issue.issueNumber && (
                    <span className="inline-flex items-center bg-slate-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--hashtag-outline] w-4 h-4"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        {match.issue.issueNumber}
                      </span>
                    </span>
                  )}

                  {/* Publication date */}
                  {match.issue.publicationDate && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--calendar-mark-bold-duotone] w-5 h-5"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        {match.issue.publicationDate}
                      </span>
                    </span>
                  )}

                  {/* Page count */}
                  {match.issue.pageCount && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--documents-minimalistic-line-duotone] w-4 h-4"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        {match.issue.pageCount} pages
                      </span>
                    </span>
                  )}

                  {/* ISBN */}
                  {match.issue.isbn && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--qr-code-line-duotone] w-4 h-4"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        ISBN: {match.issue.isbn}
                      </span>
                    </span>
                  )}

                  {/* Barcode */}
                  {match.issue.barcode && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--qr-code-line-duotone] w-4 h-4"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        {match.issue.barcode}
                      </span>
                    </span>
                  )}

                  {/* Price */}
                  {match.issue.price && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--tag-price-bold-duotone] w-4 h-4"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        {match.issue.price}
                      </span>
                    </span>
                  )}

                  {/* Variant name */}
                  {match.issue.variantName && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--star-bold-duotone] w-4 h-4"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        {match.issue.variantName}
                      </span>
                    </span>
                  )}
                </span>

                {/* Issue description/notes */}
                {issueDescription && (
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {ellipsize(issueDescription, 300)}
                  </div>
                )}
              </div>
            </div>

            {/* Series information section */}
            <div className="flex flex-row gap-3 my-4 ml-10">
              {/* Series placeholder (GCD doesn't have series images) */}
              <div className="min-w-fit">
                <div className="w-12 h-16 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center">
                  <i className="icon-[solar--book-2-bold-duotone] w-6 h-6 text-slate-400"></i>
                </div>
              </div>

              {/* Series details */}
              <div className="flex-1">
                <span className="font-medium dark:text-slate-100">{match.series.name}</span>
                {match.series.sortName && match.series.sortName !== match.series.name && (
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                    ({match.series.sortName})
                  </span>
                )}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {match.series.yearBegan && (
                    <p>
                      Year: {match.series.yearBegan}
                      {match.series.yearEnded && ` - ${match.series.yearEnded}`}
                    </p>
                  )}
                  {match.series.issueCount && (
                    <p>Total Issues: {match.series.issueCount}</p>
                  )}
                  {match.series.publisher && (
                    <p>Published by {match.series.publisher.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Apply Match button */}
            <div className="flex justify-end">
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                onClick={() => applyGCDMatch(match, props.comicObjectId)}
              >
                <span className="text-md">Apply Match</span>
                <span className="w-5 h-5">
                  <i className="h-5 w-5 icon-[solar--magic-stick-3-bold-duotone]"></i>
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default GCDMatchResult;
