/**
 * @fileoverview MatchResultCard Component
 * 
 * Renders a single match result card for any metadata source.
 * Displays issue details, series information, match score, and an Apply button.
 * Conditionally renders extended fields (ISBN, page count) when available.
 * 
 * @module components/ComicDetail/MatchPanel/MatchResultCard
 */

import React from "react";
import { convert } from "html-to-text";
import ellipsize from "ellipsize";
import type { MatchResultCardProps } from "./types";
import { useApplyMatch, useMatchSource } from "./hooks";
import { useGetComicByIdQuery } from "../../../graphql/generated";

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles broken image errors by replacing with a placeholder.
 */
const handleBrokenImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = "http://localhost:3050/dist/img/noimage.svg";
};

/**
 * Badge component for displaying metadata with an icon.
 */
const Badge: React.FC<{
  icon: string;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <span className="inline-flex items-center bg-slate-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
    <span className="pr-1 pt-1">
      <i className={`${icon} w-4 h-4`} />
    </span>
    <span className="text-slate-900 dark:text-slate-900">{children}</span>
  </span>
);

/**
 * Score badge with green accent.
 */
const ScoreBadge: React.FC<{ score: number }> = ({ score }) => (
  <span className="inline-flex h-fit w-fit items-center bg-green-50 text-sm text-slate-800 font-medium px-2 rounded-md dark:text-slate-900 dark:bg-green-400">
    <span className="pr-1 pt-1">
      <i className="icon-[solar--course-up-line-duotone] w-4 h-4" />
    </span>
    <span className="text-slate-900 dark:text-slate-900">{score}</span>
  </span>
);

/**
 * Cover image component with placeholder support for sources without images (GCD).
 */
const CoverImage: React.FC<{
  url?: string;
  alt: string;
}> = ({ url, alt }) => {
  if (!url) {
    // Placeholder for sources without cover images (GCD)
    return (
      <div className="w-24 h-36 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center">
        <i className="icon-[solar--gallery-wide-line-duotone] w-8 h-8 text-slate-400" />
      </div>
    );
  }
  
  return (
    <img
      className="rounded-md w-24"
      src={url}
      alt={alt}
      onError={handleBrokenImage}
    />
  );
};

/**
 * Series image component with placeholder support.
 */
const SeriesImage: React.FC<{
  url?: string;
  alt: string;
}> = ({ url, alt }) => {
  if (!url) {
    return (
      <div className="w-12 h-16 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center">
        <i className="icon-[solar--book-2-bold-duotone] w-6 h-6 text-slate-400" />
      </div>
    );
  }
  
  return (
    <img
      src={url}
      className="rounded-md w-12"
      alt={alt}
      onError={handleBrokenImage}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a single match result card.
 * 
 * Displays normalized match data from any source (ComicVine, GCD, Metron).
 * The card adapts its display based on available data:
 * - Shows cover image if available, otherwise a placeholder icon
 * - Renders extended badges (ISBN, page count) only when present
 * - Highlights the best match (first in list) with green background
 * 
 * @param props - Component props
 * @param props.match - Normalized match data to display
 * @param props.isBestMatch - Whether this is the top match (affects styling)
 * @param props.comicObjectId - ID of the comic to apply the match to
 * @param props.queryClient - React Query client for cache invalidation
 * @param props.onMatchApplied - Callback fired after successful apply
 * 
 * @example
 * ```tsx
 * <MatchResultCard
 *   match={normalizedMatch}
 *   isBestMatch={index === 0}
 *   comicObjectId="abc123"
 *   queryClient={queryClient}
 *   onMatchApplied={() => closePanel()}
 * />
 * ```
 */
export const MatchResultCard: React.FC<MatchResultCardProps> = ({
  match,
  isBestMatch,
  comicObjectId,
  queryClient,
  onMatchApplied,
}) => {
  const config = useMatchSource(match.source);
  const { applyMatch, isPending } = useApplyMatch(match.source);
  
  // Parse HTML description if present
  let issueDescription = "";
  if (match.issue.description) {
    issueDescription = convert(match.issue.description, {
      baseElements: { selectors: ["p"] },
    });
  }
  
  /**
   * Handles the Apply Match button click.
   * Applies the match, invalidates the cache, and calls the callback.
   */
  const handleApply = async () => {
    try {
      await applyMatch(match, comicObjectId);
      
      // Invalidate and refetch the comic data
      await queryClient.invalidateQueries({
        queryKey: useGetComicByIdQuery.getKey({ id: comicObjectId }),
      });
      
      // Notify parent to close panel and switch tabs
      onMatchApplied();
    } catch (error) {
      console.error(`Error applying ${config.displayName} match:`, error);
    }
  };
  
  const bgClass = isBestMatch 
    ? "bg-green-100 dark:bg-green-900" 
    : "bg-slate-300 dark:bg-slate-700";
  
  return (
    <div className={`${bgClass} my-5 p-4 rounded-lg`}>
      {/* Issue row: cover + details */}
      <div className="flex flex-row gap-4">
        {/* Cover image */}
        <div className="min-w-fit">
          <CoverImage
            url={match.issue.coverImageUrl}
            alt={`${match.series.name} #${match.issue.number}`}
          />
        </div>
        
        <div className="flex-1">
          {/* Title and score row */}
          <div className="flex flex-row mb-1 justify-between">
            <p className="text-md font-medium dark:text-slate-100">
              {match.issue.title || match.series.name}
            </p>
            <ScoreBadge score={match.score} />
          </div>
          
          {/* Core badges: issue number, cover date */}
          <span className="flex flex-row gap-2 mb-2 flex-wrap">
            <Badge icon="icon-[solar--hashtag-outline]">
              {match.issue.number}
            </Badge>
            
            {match.issue.coverDate && (
              <Badge icon="icon-[solar--calendar-mark-bold-duotone]">
                {match.issue.coverDate}
              </Badge>
            )}
          </span>
          
          {/* Extended badges (GCD-specific fields) */}
          {match.extended && (
            <span className="flex flex-row gap-2 mb-2 flex-wrap">
              {match.extended.pageCount && (
                <Badge icon="icon-[solar--documents-minimalistic-line-duotone]">
                  {match.extended.pageCount} pages
                </Badge>
              )}
              
              {match.extended.isbn && (
                <Badge icon="icon-[solar--qr-code-line-duotone]">
                  ISBN: {match.extended.isbn}
                </Badge>
              )}
              
              {match.extended.barcode && (
                <Badge icon="icon-[solar--qr-code-line-duotone]">
                  {match.extended.barcode}
                </Badge>
              )}
              
              {match.extended.price && (
                <Badge icon="icon-[solar--tag-price-bold-duotone]">
                  {match.extended.price}
                </Badge>
              )}
              
              {match.extended.variantName && (
                <Badge icon="icon-[solar--star-bold-duotone]">
                  {match.extended.variantName}
                </Badge>
              )}
            </span>
          )}
          
          {/* Issue description */}
          {issueDescription && (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {ellipsize(issueDescription, 300)}
            </div>
          )}
        </div>
      </div>
      
      {/* Series information row */}
      <div className="flex flex-row gap-3 my-4 ml-10">
        <div className="min-w-fit">
          <SeriesImage
            url={match.series.coverImageUrl}
            alt={match.series.name}
          />
        </div>
        
        <div className="flex-1">
          <span className="font-medium dark:text-slate-100">
            {match.series.name}
          </span>
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
          type="button"
          className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleApply}
          disabled={isPending}
        >
          <span className="text-md">
            {isPending ? "Applying..." : "Apply Match"}
          </span>
          <span className="w-5 h-5">
            <i className={`h-5 w-5 ${isPending ? "icon-[solar--loading-bold-duotone] animate-spin" : "icon-[solar--magic-stick-3-bold-duotone]"}`} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default MatchResultCard;
