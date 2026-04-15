export const removeLeadingPeriod = (input: string): string => {
  if (input.charAt(0) == ".") {
    input = input.substr(1);
  }
  return input;
};

export const escapePoundSymbol = (input: string): string => {
  return input.replace(/\#/gm, "%23");
};

interface ComicBookDocument {
  id: string;
  canonicalMetadata?: {
    series?: { value?: string | null } | null;
    issueNumber?: { value?: string | number | null } | null;
  } | null;
  inferredMetadata?: {
    issue?: { name?: string | null; number?: string | number | null } | null;
  } | null;
  rawFileDetails?: {
    name?: string | null;
  } | null;
}

/**
 * Generates a display label for a comic book from its metadata.
 * Prioritizes canonical metadata, falls back to inferred, then raw file name.
 *
 * @param comic - The comic book document object
 * @returns A formatted string like "Series Name #123" or the file name as fallback
 */
export const getComicDisplayLabel = (comic: ComicBookDocument): string => {
  const series =
    comic.canonicalMetadata?.series?.value ??
    comic.inferredMetadata?.issue?.name;
  const issueNum =
    comic.canonicalMetadata?.issueNumber?.value ??
    comic.inferredMetadata?.issue?.number;
  if (series && issueNum) return `${series} #${issueNum}`;
  if (series) return series;
  return comic.rawFileDetails?.name ?? comic.id;
};
