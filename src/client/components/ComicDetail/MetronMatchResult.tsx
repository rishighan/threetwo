import React from "react";
import { isNil, map } from "lodash";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { useGetComicByIdQuery } from "../../graphql/generated";
import type { MetronMatchResultProps, MetronMatch } from "../../types";

const handleBrokenImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = "http://localhost:3050/dist/img/noimage.svg";
};

/**
 * GraphQL mutation for applying Metron metadata to a comic
 */
const APPLY_METRON_METADATA_MUTATION = `
  mutation ApplyMetronMetadata($input: ApplyMetronMetadataInput!) {
    applyMetronMetadata(input: $input) {
      success
      message
      comicObjectId
      updatedAt
    }
  }
`;

/**
 * Displays individual Metron match results with issue and series information.
 * Each match card shows the issue cover, metadata, series info, match score,
 * and an Apply Match button to save the metadata to the comic.
 */
export const MetronMatchResult = (props: MetronMatchResultProps) => {
  /**
   * Applies the selected Metron match to the comic document.
   * Calls the GraphQL mutation to update sourcedMetadata.metron.
   */
  const applyMetronMatch = async (match: MetronMatch, comicObjectId: string) => {
    try {
      const response = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: APPLY_METRON_METADATA_MUTATION,
          variables: {
            input: {
              comicObjectId,
              metronIssueId: match.issue.id,
              metronSeriesId: match.series.id,
            },
          },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        console.error("GraphQL errors:", json.errors);
        throw new Error(json.errors[0]?.message || "Failed to apply Metron metadata");
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

      return json.data?.applyMetronMetadata;
    } catch (error) {
      console.error("Error applying Metron match:", error);
      throw error;
    }
  };

  return (
    <>
      <span className="flex items-center mt-6">
        <span className="text-md text-slate-500 dark:text-slate-500 pr-5">
          Metron Matches
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
      </span>
      {map(props.matchData, (match, idx) => {
        // Parse issue description if available
        let issueDescription = "";
        if (!isNil(match.issue.desc)) {
          issueDescription = convert(match.issue.desc, {
            baseElements: {
              selectors: ["p"],
            },
          });
        }

        // Highlight best match with green background
        const bestMatchCSSClass = idx === 0 ? "bg-green-100" : "bg-slate-300";

        return (
          <div className={`${bestMatchCSSClass} my-5 p-4 rounded-lg`} key={idx}>
            <div className="flex flex-row gap-4">
              {/* Issue cover image */}
              <div className="min-w-fit">
                <img
                  className="rounded-md w-24"
                  src={match.issue.image}
                  onError={handleBrokenImage}
                  alt={`${match.series.name} #${match.issue.issueNumber}`}
                />
              </div>

              <div className="flex-1">
                {/* Issue name and score row */}
                <div className="flex flex-row mb-1 justify-between">
                  {match.issue.name ? (
                    <p className="text-md font-medium">{match.issue.name}</p>
                  ) : (
                    <p className="text-md font-medium">{match.series.name}</p>
                  )}

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
                  <span className="inline-flex items-center bg-slate-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                    <span className="pr-1 pt-1">
                      <i className="icon-[solar--hashtag-outline] w-4 h-4"></i>
                    </span>
                    <span className="text-slate-900 dark:text-slate-900">
                      {match.issue.issueNumber}
                    </span>
                  </span>

                  {/* Cover date */}
                  {match.issue.cover_date && (
                    <span className="inline-flex items-center bg-slate-50 text-slate-800 text-sm font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                      <span className="pr-1 pt-1">
                        <i className="icon-[solar--calendar-mark-bold-duotone] w-5 h-5"></i>
                      </span>
                      <span className="text-slate-900 dark:text-slate-900">
                        Cover: {match.issue.cover_date}
                      </span>
                    </span>
                  )}
                </span>

                {/* Issue description */}
                {issueDescription && (
                  <div className="text-sm text-slate-700">
                    {ellipsize(issueDescription, 300)}
                  </div>
                )}
              </div>
            </div>

            {/* Series information section */}
            <div className="flex flex-row gap-3 my-4 ml-10">
              {/* Series image */}
              <div className="min-w-fit">
                <img
                  src={match.series.image}
                  className="rounded-md w-12"
                  onError={handleBrokenImage}
                  alt={match.series.name}
                />
              </div>

              {/* Series details */}
              <div className="flex-1">
                <span className="font-medium">{match.series.name}</span>
                <div className="text-sm text-slate-600">
                  <p>Year Started: {match.series.year_began}</p>
                  <p>Total Issues: {match.series.issue_count}</p>
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
                onClick={() => applyMetronMatch(match, props.comicObjectId)}
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

export default MetronMatchResult;
