import { default as nlp } from "compromise";
import { default as dates } from "compromise-dates";
import { default as sentences } from "compromise-sentences";
import { default as numbers } from "compromise-numbers";
import _ from "lodash";

nlp.extend(sentences);
nlp.extend(numbers);
nlp.extend(dates);

/**
 * Tokenizes a search string
 * @function
 * @param {string} inputString - The string used to search against CV, Shortboxed, and other APIs.
 */
export const tokenize = (searchCriteriaPayload) => {
  const { inputString } = searchCriteriaPayload;
  const doc = nlp(inputString);
  const sentence = doc.sentences().json();
  const number = doc.numbers().fractions();

  // regexes to match constituent parts of the search string
  // and isolate the search terms
  const chapters = inputString.match(/ch(a?p?t?e?r?)(\W?)(\_?)(\#?)(\d)/gi);
  const volumes = inputString.match(
    /(\b(vo?l?u?m?e?)\.?)(\s*-|\s*_)?(\s*[0-9]+[.0-9a-z]*)/gi,
  );
  const pageCounts = inputString.match(
    /\b[.,]?\s*\d+\s*(p|pg|pgs|pages)\b\s*/gi,
  );

  const parantheses = inputString.match(/\([^\(]*?\)/gi);
  const curlyBraces = inputString.match(/\{[^\{]*?\}/gi);
  const squareBrackets = inputString.match(/\[[^\[]*?\]/gi);
  const genericNumericRange = inputString.match(
    /([^\d]+)(\s*(of|de|di|von|van|z)\s*#*\d+)/gi,
  );
  const hyphenatedNumericRange = inputString.match(/([^\d])?(-\d+)/gi);
  const readingListIndicators = inputString.match(
    /^\s*\d+(\.\s+?|\s*-?\s*)/gim,
  );

  const issues = inputString.match(/issue(\W?)(\_?)(\d+)/gi);
  const issueHashes = inputString.match(/\#\d/gi);
  const yearMatches = inputString.match(/\d{4}/gi);

  const sentenceToProcess = sentence[0].normal.replace(/_/g, " ");
  const normalizedSentence = nlp(sentenceToProcess)
    .text("normal")
    .trim()
    .split(" ");

  const queryObject = {
    comicbook_identifiers: {
      issues,
      issueHashes,
      chapters,
      volumes,
      issueRanges: number,
    },
    years: {
      yearMatches,
    },
    sentences: {
      detailed: sentence,
      normalized: normalizedSentence,
    },
  };
  return queryObject;
};

export function refineQuery(queryString) {
  const queryObj = tokenize(queryString);
  const removedYears = _.xor(
    queryObj.sentences.normalized,
    queryObj.years.yearMatches,
  );
  return {
    tokenized: removedYears,
    normalized: removedYears.join(" "),
    meta: queryObj,
  };
}
