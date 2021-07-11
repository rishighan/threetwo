import { default as nlp } from "compromise";
import { default as dates } from "compromise-dates";
import { default as sentences } from "compromise-sentences";
import { default as numbers } from "compromise-numbers";
import xregexp from "xregexp";
import { map, xor, isEmpty } from "lodash";

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
  const number = doc.numbers().fractions();

  // regexes to match constituent parts of the search string
  // and isolate the search terms
  const foo = replaceRecursive(
    "jagan sampatkar ((((asdasd)(Asdasd)(3019)))) (123) milun",
    "\\(",
    "\\)",
    (match) => "",
  );
  console.log(foo);
  const chapters = inputString.replace(
    /ch(a?p?t?e?r?)(\W?)(\_?)(\#?)(\d)/gi,
    "",
  );
  const volumes = inputString.replace(
    /(\b(vo?l?u?m?e?)\.?)(\s*-|\s*_)?(\s*[0-9]+[.0-9a-z]*)/gi,
    "",
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
  if (!isEmpty(issues)) {
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
  const removedYears = xor(
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
