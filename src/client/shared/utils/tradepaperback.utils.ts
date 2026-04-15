/**
 * @fileoverview Utility functions for detecting comic book issue types.
 * Analyzes deck/description text to identify trade paperbacks, mini-series,
 * and other collected edition formats.
 * @module shared/utils/tradepaperback
 */

import { flatten, compact, map, isEmpty, isNil } from "lodash";
import axios from "axios";

/**
 * @typedef {Object} IssueTypeMatcher
 * @property {RegExp[]} regex - Array of regex patterns to match against the deck text
 * @property {string} displayName - Human-readable name for the issue type
 */

/**
 * @typedef {Object} IssueTypeMatch
 * @property {string} displayName - The display name of the matched issue type
 * @property {string[]} results - Array of matched strings from the deck text
 */

/**
 * Detects the type of comic issue from its deck/description text.
 * Identifies formats like Trade Paperbacks (TPB), hardcover collections,
 * and mini-series based on keyword patterns.
 *
 * @param {string} deck - The deck or description text to analyze
 * @returns {IssueTypeMatch|undefined} The first matched issue type with its display name
 *                                      and matched strings, or undefined if no match
 * @example
 * detectIssueTypes("Collects issues #1-6 in trade paperback format")
 * // returns { displayName: "Trade Paperback", results: ["trade paperback"] }
 *
 * @example
 * detectIssueTypes("A 4-issue mini-series")
 * // returns { displayName: "Mini-Series", results: ["mini-series"] }
 */
export const detectIssueTypes = (deck: string): any => {
  const issueTypeMatchers = [
    {
      regex: [
        /((trade)?\s?(paperback)|(tpb))/gim, // https://regex101.com/r/FhuowT/1
        /(hard\s?cover)\s?(collect((ion)|(ed)|(ing)))/gim, // https://regex101.com/r/eFJVRM/1
      ],
      displayName: "Trade Paperback",
    },
    { regex: [/mini\Wseries/gim], displayName: "Mini-Series" },
  ];

  const matches = map(issueTypeMatchers, (matcher) => {
    return getIssueTypeDisplayName(deck, matcher.regex, matcher.displayName);
  });

  return compact(matches)[0];
};

/**
 * Tests a deck string against regex patterns and returns match info if found.
 *
 * @private
 * @param {string} deck - The deck or description text to search
 * @param {RegExp[]} regexPattern - Array of regex patterns to test against
 * @param {string} displayName - The display name to return if a match is found
 * @returns {IssueTypeMatch|undefined} Object with displayName and results if matched,
 *                                      otherwise undefined
 */
const getIssueTypeDisplayName = (
  deck: string,
  regexPattern: RegExp[],
  displayName: string,
) => {
  try {
    const matches = [...regexPattern]
      .map((regex) => {
        if (!isNil(deck)) {
          return deck.match(regex);
        }
      })
      .map((item) => {
        if (item !== undefined) {
          return item;
        }
      });
    const results = flatten(compact(matches));
    if (!isEmpty(results)) {
      return { displayName, results };
    }
  } catch (error) {
    // Error handling could be added here if needed
  }
};
