/**
 * @fileoverview CollapsibleSearchForm Component
 * 
 * Wraps MatchSearchForm in a collapsible container.
 * Used in sliding panels to allow users to manually search when auto-matching
 * doesn't produce satisfactory results.
 * 
 * @module components/ComicDetail/MatchPanel/CollapsibleSearchForm
 */

import React, { useState } from "react";
import type { CollapsibleSearchFormProps } from "./types";
import { MatchSearchForm } from "./MatchSearchForm";

/**
 * Collapsible container for the search form.
 * 
 * Initially collapsed to keep the UI clean. When expanded, reveals
 * the MatchSearchForm for manual metadata searches.
 * 
 * @param props - Component props
 * @param props.source - Metadata source for form customization
 * @param props.onSearch - Callback fired when search is submitted
 * @param props.initialValues - Optional initial form values
 * 
 * @example
 * ```tsx
 * <CollapsibleSearchForm
 *   source="gcd"
 *   onSearch={(values) => handleManualSearch(values)}
 * />
 * ```
 */
export const CollapsibleSearchForm: React.FC<CollapsibleSearchFormProps> = ({
  source,
  onSearch,
  initialValues,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
      {/* Collapse toggle button */}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          Manual Search
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {isExpanded ? "Click to collapse" : "No results? Search manually"}
        </span>
      </button>
      
      {/* Expandable form content */}
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-800">
          <MatchSearchForm
            source={source}
            onSearch={onSearch}
            initialValues={initialValues}
          />
        </div>
      )}
    </div>
  );
};

export default CollapsibleSearchForm;
