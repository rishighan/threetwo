import { each, isUndefined, isNull } from "lodash";
const stringSimilarity = require("string-similarity");

export const matchScorer = (searchMatches, searchQuery) => {
  // 1. Check if it exists in the db (score: 0)
  // 2. Check if issue name matches strongly (score: ++)
  // 3. Check if issue number matches strongly (score: ++)
  // 4. Check if issue covers hash match strongly (score: +++)
  // 5. Check if issue year matches strongly (score: +)
  const score = 0;
  console.log("yedvadkar", searchMatches);
  each(searchMatches, (match, idx) => {
    if (!isNull(searchQuery.issue.meta.normalized) && !isNull(match.name)) {
      const issueNameScore = stringSimilarity.compareTwoStrings(
        searchQuery.issue.meta.normalized,
        match.name,
      );
      match.score = issueNameScore;
      console.log("name score" + idx + ":", issueNameScore);
    } else {
      console.log("match not possible");
    }
  });
  return searchMatches;

  // check for the issue name match
};
