import { each, isUndefined, isNull } from "lodash";
const stringSimilarity = require("string-similarity");

export const matchScorer = (searchMatches, searchQuery) => {
  // 1. Check if it exists in the db (score: 0)
  // 2. Check if issue name matches strongly (score: ++)
  // 3. Check if issue number matches strongly (score: ++)
  // 4. Check if issue covers hash match strongly (score: +++)
  // 5. Check if issue year matches strongly (score: +)
  const score = 0;
  each(searchMatches, (match, idx) => {
    console.log("SEARCH QUERY IN SMS:", searchQuery);
    console.log("MATCH NAME:", match);
    match.score = 0;
    if (
      !isNull(searchQuery.issue.searchParams.searchTerms.name) &&
      !isNull(match.name)
    ) {
      const issueNameScore = stringSimilarity.compareTwoStrings(
        searchQuery.issue.searchParams.searchTerms.name,
        match.name,
      );
      match.score = issueNameScore;
      console.log("name score" + idx + ":", issueNameScore);
    }

    // issue number matches
    if (
      !isNull(searchQuery.issue.searchParams.searchTerms.number) &&
      !isNull(match.issue_number)
    ) {
      if (
        parseInt(searchQuery.issue.searchParams.searchTerms.number, 10) ===
        parseInt(match.issue_number, 10)
      ) {
        match.score += 2;
        console.log(match.score);
      }
    }
  });
  return searchMatches;

  // check for the issue name match
};
