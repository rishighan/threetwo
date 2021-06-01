import { default as nlp } from "compromise";
import { default as dates } from "compromise-dates";
import { default as sentences } from "compromise-sentences";
import { default as numbers } from "compromise-numbers";
import _ from "lodash";

nlp.extend(sentences);
nlp.extend(numbers);
nlp.extend(dates);

export function tokenize(inputString) {
  const doc = nlp(inputString);
  const sentence = doc.sentences().json();
  const number = doc.numbers().fractions();
  const chapters = inputString.match(/ch(a?p?t?e?r?)(\W?)(\_?)(\#?)(\d)/gi);
  const volumes = inputString.match(/v(o?l?u?m?e?)(\W?)(\_?)(\s?)(\d+)/gi);
  const issues = inputString.match(/issue(\W?)(\_?)(\d+)/gi);
  const issueHashes = inputString.match(/\#\d/gi);
  const yearMatches = inputString.match(/\d{4}/g);

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
}

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
