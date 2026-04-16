import React, { useState } from "react";
import { ComicVineSearchForm } from "./ComicVineSearchForm";
import { ComicVineMatchPanel } from "./ComicVineMatchPanel";
import { EditMetadataPanel } from "./EditMetadataPanel";
import type { RawFileDetails, InferredMetadata } from "../../graphql/generated";

interface CVMatchesPanelProps {
  rawFileDetails?: RawFileDetails;
  inferredMetadata: InferredMetadata;
  comicVineMatches: any[];
  comicObjectId: string;
  queryClient: any;
  onMatchApplied: () => void;
};

/**
 * Collapsible container for manual ComicVine search form.
 * Allows users to manually search when auto-match doesn't yield results.
 */
const CollapsibleSearchForm: React.FC<{ rawFileDetails?: RawFileDetails }> = ({
  rawFileDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Manual Search
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {isExpanded ? "Click to collapse" : "No results? Search manually"}
        </span>
      </button>
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-800">
          <ComicVineSearchForm rawFileDetails={rawFileDetails} />
        </div>
      )}
    </div>
  );
};

/**
 * Sliding panel content for ComicVine match search.
 *
 * Renders a search form pre-populated from `rawFileDetails`, a preview of the
 * inferred issue being searched for, and a list of ComicVine match candidates
 * the user can apply to the comic.
 *
 * @param props.onMatchApplied - Called after the user selects and applies a match,
 *   allowing the parent to close the panel and refresh state.
 */
export const CVMatchesPanel: React.FC<CVMatchesPanelProps> = ({
  rawFileDetails,
  inferredMetadata,
  comicVineMatches,
  comicObjectId,
  queryClient,
  onMatchApplied,
}) => (
  <>
    <div className="border-slate-500 border rounded-lg p-2 mb-3">
      <p className="text-slate-600 dark:text-slate-300">Searching for:</p>
      {inferredMetadata.issue ? (
        <>
          <span className="text-slate-800 dark:text-slate-100 font-medium">{inferredMetadata.issue?.name} </span>
          <span className="text-slate-600 dark:text-slate-300"> # {inferredMetadata.issue?.number} </span>
        </>
      ) : null}
    </div>

    <CollapsibleSearchForm rawFileDetails={rawFileDetails} />

    <ComicVineMatchPanel
      props={{
        comicVineMatches,
        comicObjectId,
        queryClient,
        onMatchApplied,
      }}
    />
  </>
);

type EditMetadataPanelWrapperProps = {
  rawFileDetails?: RawFileDetails;
};

export const EditMetadataPanelWrapper: React.FC<EditMetadataPanelWrapperProps> = ({
  rawFileDetails,
}) => <EditMetadataPanel data={rawFileDetails ?? {}} />;
