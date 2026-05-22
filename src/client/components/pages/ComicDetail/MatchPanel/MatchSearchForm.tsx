/**
 * @fileoverview MatchSearchForm Component
 * 
 * Unified search form for manual metadata searches across all sources.
 * Provides fields for series name, issue number, and publication year.
 * 
 * @module components/ComicDetail/MatchPanel/MatchSearchForm
 */

import React, { useCallback } from "react";
import { Form, Field } from "react-final-form";
import type { ValidationErrors } from "final-form";
import type { MatchSearchFormProps, SearchFormValues, MetadataSource } from "./types";
import { useMatchSource } from "./hooks";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Source-specific form labels and placeholders.
 */
const getFormLabels = (source: MetadataSource) => {
  switch (source) {
    case "comicvine":
      return {
        nameLabel: "Issue Name",
        namePlaceholder: "Type the issue name",
        buttonText: "Search",
      };
    case "gcd":
      return {
        nameLabel: "Series Name",
        namePlaceholder: "Type the series name",
        buttonText: "Search GCD",
        buttonIcon: "icon-[solar--database-bold-duotone]",
      };
    case "metron":
      return {
        nameLabel: "Series Name",
        namePlaceholder: "Type the series name",
        buttonText: "Search",
      };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unified search form for manual metadata searches.
 * 
 * This form allows users to manually search for comic metadata when
 * auto-matching doesn't find suitable results. It provides fields for:
 * - Series/Issue name
 * - Issue number
 * - Publication year
 * 
 * @param props - Component props
 * @param props.source - Metadata source (affects labels and button text)
 * @param props.onSearch - Callback fired when form is submitted
 * @param props.initialValues - Optional initial form values
 * 
 * @example
 * ```tsx
 * <MatchSearchForm
 *   source="gcd"
 *   onSearch={(values) => searchGCD(values)}
 *   initialValues={{ issueName: "Spider-Man", issueNumber: "1" }}
 * />
 * ```
 */
export const MatchSearchForm: React.FC<MatchSearchFormProps> = ({
  source,
  onSearch,
  initialValues,
}) => {
  const config = useMatchSource(source);
  const labels = getFormLabels(source);
  
  const onSubmit = useCallback((values: SearchFormValues) => {
    onSearch(values);
  }, [onSearch]);
  
  const validate = (_values: SearchFormValues): ValidationErrors | undefined => {
    return undefined;
  };
  
  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          {/* Series/Issue name field */}
          <label className="block py-1 text-slate-700 dark:text-slate-200">
            {labels.nameLabel}
          </label>
          <Field name="issueName">
            {(props) => (
              <input
                {...props.input}
                className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                placeholder={labels.namePlaceholder}
              />
            )}
          </Field>
          
          {/* Number and year row */}
          <div className="flex flex-row gap-4 mt-2">
            {/* Issue number field */}
            <div>
              <label className="block py-1 text-slate-700 dark:text-slate-200">
                Issue Number
              </label>
              <Field name="issueNumber">
                {(props) => (
                  <input
                    {...props.input}
                    className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-14 rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-2 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    placeholder="#"
                  />
                )}
              </Field>
            </div>
            
            {/* Year field */}
            <div>
              <label className="block py-1 text-slate-700 dark:text-slate-200">
                Year
              </label>
              <Field name="issueYear">
                {(props) => (
                  <input
                    {...props.input}
                    className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-20 rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-2 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    placeholder="1984"
                  />
                )}
              </Field>
            </div>
            
            {/* Search button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="flex h-10 items-center rounded-lg border border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-600 dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:bg-green-700"
              >
                {labels.buttonIcon && (
                  <span className="pr-1">
                    <i className={`${labels.buttonIcon} w-4 h-4`} />
                  </span>
                )}
                {labels.buttonText}
              </button>
            </div>
          </div>
        </form>
      )}
    />
  );
};

export default MatchSearchForm;
