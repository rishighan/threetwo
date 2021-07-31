/*
 * MIT License
 *
 * Copyright (c) 2015 Rishi Ghan
 *
 The MIT License (MIT)

Copyright (c) 2015 Rishi Ghan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
 */

/*
 * Revision History:
 *     Initial:        2021/07/29        Rishi Ghan
 */

import { each, map, isUndefined, isNull, assign } from "lodash";
const stringSimilarity = require("string-similarity");
import axios from "axios";

export const matchScorer = (searchMatches, searchQuery, rawFileDetails) => {
  // 1. Check if it exists in the db (score: 0)
  // 2. Check if issue name matches strongly (score: ++)
  // 3. Check if issue number matches strongly (score: ++)
  // 4. Check if issue covers hash match strongly (score: +++)
  // 5. Check if issue year matches strongly (score: +)

 each(searchMatches, (match, idx) => {
    // check for the issue name match
   
    if (
      !isNull(searchQuery.issue.searchParams.searchTerms.name) &&
      !isNull(match.name)
    ) {
      const issueNameScore = stringSimilarity.compareTwoStrings(
        searchQuery.issue.searchParams.searchTerms.name,
        match.name,
      );
      match.score = issueNameScore;
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
        match.score += 1;
      }
    }

    return match;
  });

  return searchMatches;
};

export const compareCoverImageHashes = (original, matches) => {
  // cover matches
  // calculate the image hashes of the covers and compare the Levenshtein Distance
  each(matches, async (match) => {
    const result = await axios.request({
      url: "http://localhost:3000/api/imagetransformation/calculateLevenshteinDistance",
      method: "POST",
      data: {
        imagePath: original.path,
        imagePath2: match.image.small_url,
        options: {
          match_id: match.id,
        },
      },
    });

    if (result.data.levenshteinDistance === 0) {
      match.score += 4;
    } else {
      match.score -= 4;
    }
  });
  return matches;
};
