import { default as nlp } from "compromise";
import { default as dates } from "compromise-dates";
import { default as sentences } from "compromise-sentences";
import { default as numbers } from "compromise-numbers";
import xregexp from "xregexp";
import { MatchArray } from "xregexp/types";
import voca from "voca";
import { xor, isEmpty, isNull } from "lodash";

nlp.extend(sentences);
nlp.extend(numbers);
nlp.extend(dates);

interface M {
  start: number;
  end: number;
  value: string;
}

function replaceRecursive(
  text: string,
  left: string,
  right: string,
  replacer: (match: string) => string,
): string {
  const r: M[] = xregexp.matchRecursive(text, left, right, "g", {
    valueNames: [null, null, "match", null],
  });
  let offset = 0;
  for (const m of r) {
    const replacement = replacer(m.value);
    text = replaceAt(text, m.start + offset, m.value.length, replacement);
    offset += replacement.length - m.value.length;
  }
  return text;
}

function replaceAt(
  string: string,
  index: number,
  length: number,
  replacement: string,
): string {
  return string.substr(0, index) + replacement + string.substr(index + length);
}

export const preprocess = (inputString: string) => {
  // see if the comic matches the following format, and if so, remove everything
  // after the first number:
  // "nnn series name #xx (etc) (etc)" -> "series name #xx (etc) (etc)"
  const format1 = "124 series name #xx (etc) (etc)".match(
    /^\s*(\d+)[\s._-]+?([^#]+)(\W+.*)/,
  );

  //   see if the comic matches the following format, and if so, remove everything
  // after the first number that isn't in brackets:
  // "series name #xxx - title (etc) (etc)" -> "series name #xxx (etc) (etc)
  const format2 = "".match(
    /^((?:[a-zA-Z,.-]+\s)+)(\#?(?:\d+[.0-9*])\s*(?:-))(.*((\(.*)?))$/gis,
  );
};

/**
 * Tokenizes a search string
 * @function
 * @param {string} inputString - The string used to search against CV, Shortboxed, and other APIs.
 */
export const tokenize = (inputString: string) => {
  const doc = nlp(inputString);
  const sentence = doc.sentences().json();

  // regexes to match constituent parts of the search string
  // and isolate the search terms

  inputString.replace(/ch(a?p?t?e?r?)(\W?)(\_?)(\#?)(\d)/gi, "");
  inputString.replace(
    /(\b(vo?l?u?m?e?)\.?)(\s*-|\s*_)?(\s*[0-9]+[.0-9a-z]*)/gi,
    "",
  );
  inputString.replace(/\b[.,]?\s*\d+\s*(p|pg|pgs|pages)\b\s*/gi, "");

  // if the name has things like "4 of 5", remove the " of 5" part
  // also, if the name has 3-6, remove the -6 part.  note that we'll
  // try to handle the word "of" in a few common languages, like french/
  // spanish (de), italian (di), german (von), dutch (van) or polish (z)
  replaceRecursive(inputString, "\\(", "\\)", () => "");
  replaceRecursive(inputString, "\\[", "\\]", () => "");
  replaceRecursive(inputString, "\\{", "\\}", () => "");
  inputString.replace(/\([^\(]*?\)/gi, "");
  inputString.replace(/\{[^\{]*?\}/gi, "");
  inputString.replace(/\[[^\[]*?\]/gi, "");

  inputString.replace(/([^\d]+)(\s*(of|de|di|von|van|z)\s*#*\d+)/gi, "");

  const hyphenatedIssueRange = inputString.match(/(\d)(-\d+)/gi);
  if (!isNull(hyphenatedIssueRange) && hyphenatedIssueRange.length > 2) {
    let issueNumber = hyphenatedIssueRange[0];
  }

  const readingListIndicators = inputString.match(
    /^\s*\d+(\.\s+?|\s*-?\s*)/gim,
  );

  let issueNumbers = "";
  let parsedIssueNumber = "";
  const issues = inputString.match(/(^|[_\s#])(-?\d*\.?\d\w*)/gi);

  if (!isEmpty(issues) && !isNull(issues)) {
    issueNumbers = issues[0].trim();
    const matches = extractNumerals(issueNumbers);
    // if we parsed out some potential issue numbers, designate the LAST
    // (rightmost) one as the actual issue number, and remove it from the name

    if (matches.length > 0) {
      parsedIssueNumber = matches[0].pop();
    }
  }

  inputString = voca.replace(inputString, parsedIssueNumber, "");
  inputString = voca.replace(inputString, /_.-# /gi, "");
  inputString = nlp(inputString).text("normal").trim();

  const yearMatches = inputString.match(/\d{4}/gi);

  const sentenceToProcess = sentence[0].normal.replace(/_/g, " ");
  const normalizedSentence = nlp(sentenceToProcess)
    .text("normal")
    .trim()
    .split(" ");

  const queryObject = {
    comicbook_identifier_tokens: {
      inputString,
      parsedIssueNumber,
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

export const extractNumerals = (inputString: string): MatchArray[string] => {
  // Searches through the given string left-to-right, building an ordered list of
  // "issue number-like" re.match objects.  For example, this method finds
  // matches substrings like:  3, #4, 5a, 6.00, 10.0b, .5, -1.0
  const matches: MatchArray[string] = [];
  xregexp.forEach(inputString, /(^|[_\s#])(-?\d*\.?\d\w*)/gmu, (match) => {
    matches.push(match);
  });
  return matches;
};

export const refineQuery = (inputString: string) => {
  const queryObj = tokenize(inputString);
  const removedYears = xor(
    queryObj.sentence_tokens.normalized,
    queryObj.years.yearMatches,
  );
  return {
    searchParams: {
      searchTerms: {
        name: queryObj.comicbook_identifier_tokens.inputString,
        number: queryObj.comicbook_identifier_tokens.parsedIssueNumber,
      },
    },
    meta: {
      queryObj,
      tokenized: removedYears,
      normalized: removedYears.join(" "),
    },
  };
};
