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
export const tokenize = (inputString) => {
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

  let issueNumbers = "";
  const issues = inputString.match(/(^|[_\s#])(-?\d*\.?\d\w*)/gi);
  if (!_.isEmpty(issues)) {
    issueNumbers = issues[0].trim();
  }
  // const issueHashes = inputString.match(/\#\d/gi);
  const yearMatches = inputString.match(/\d{4}/gi);

  const sentenceToProcess = sentence[0].normal.replace(/_/g, " ");
  const normalizedSentence = nlp(sentenceToProcess)
    .text("normal")
    .trim()
    .split(" ");

  const queryObject = {
    comicbook_identifier_tokens: {
      issueNumbers,
      chapters,
      pageCounts,
      parantheses,
      curlyBraces,
      squareBrackets,
      genericNumericRange,
      hyphenatedNumericRange,
      readingListIndicators,
      volumes,
    },
    years: {
      yearMatches,
    },
    sentence_tokens: {
      detailed: sentence,
      normalized: normalizedSentence,
    },
  };
  return queryObject;
};

export const refineQuery = (inputString) => {
  const queryObj = tokenize(inputString);
  const removedYears = _.xor(
    queryObj.sentence_tokens.normalized,
    queryObj.years.yearMatches,
  );
  return {
    searchParams: {
      searchTerms: {
        name: queryObj.sentence_tokens.detailed[0].text,
        number: queryObj.comicbook_identifier_tokens.issueNumbers,
      },
      year: queryObj.years,
    },
    meta: {
      queryObj,
      tokenized: removedYears,
      normalized: removedYears.join(" "),
    },
  };
};
