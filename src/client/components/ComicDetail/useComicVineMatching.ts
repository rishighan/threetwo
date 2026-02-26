import { useState } from "react";
import axios from "axios";
import { isNil, isUndefined, isEmpty } from "lodash";
import { refineQuery } from "filename-parser";
import { COMICVINE_SERVICE_URI } from "../../constants/endpoints";

interface ComicVineMatch {
  score: number;
  [key: string]: any;
}

interface ComicVineSearchQuery {
  inferredIssueDetails: {
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface RawFileDetails {
  name: string;
  [key: string]: any;
}

interface ComicVineMetadata {
  name?: string;
  [key: string]: any;
}

export const useComicVineMatching = () => {
  const [comicVineMatches, setComicVineMatches] = useState<ComicVineMatch[]>([]);

  const fetchComicVineMatches = async (
    searchPayload: any,
    issueSearchQuery: ComicVineSearchQuery,
    seriesSearchQuery: ComicVineSearchQuery,
  ) => {
    try {
      const response = await axios({
        url: `${COMICVINE_SERVICE_URI}/volumeBasedSearch`,
        method: "POST",
        data: {
          format: "json",
          // hack
          query: issueSearchQuery.inferredIssueDetails.name
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim(),
          limit: "100",
          page: 1,
          resources: "volume",
          scorerConfiguration: {
            searchParams: issueSearchQuery.inferredIssueDetails,
          },
          rawFileDetails: searchPayload,
        },
        transformResponse: (r) => {
          const matches = JSON.parse(r);
          return matches;
        },
      });
      let matches: ComicVineMatch[] = [];
      if (!isNil(response.data.results) && response.data.results.length === 1) {
        matches = response.data.results;
      } else {
        matches = response.data.map((match: ComicVineMatch) => match);
      }
      const scoredMatches = matches.sort((a: ComicVineMatch, b: ComicVineMatch) => b.score - a.score);
      setComicVineMatches(scoredMatches);
    } catch (err) {
      console.log(err);
    }
  };

  const prepareAndFetchMatches = (
    rawFileDetails: RawFileDetails | undefined,
    comicvine: ComicVineMetadata | undefined,
  ) => {
    let seriesSearchQuery: ComicVineSearchQuery = {} as ComicVineSearchQuery;
    let issueSearchQuery: ComicVineSearchQuery = {} as ComicVineSearchQuery;

    if (!isUndefined(rawFileDetails)) {
      issueSearchQuery = refineQuery(rawFileDetails.name) as ComicVineSearchQuery;
    } else if (!isEmpty(comicvine) && comicvine?.name) {
      issueSearchQuery = refineQuery(comicvine.name) as ComicVineSearchQuery;
    }
    fetchComicVineMatches(rawFileDetails, issueSearchQuery, seriesSearchQuery);
  };

  return {
    comicVineMatches,
    prepareAndFetchMatches,
  };
};
