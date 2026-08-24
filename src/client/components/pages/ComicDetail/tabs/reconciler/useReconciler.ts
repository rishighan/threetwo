/**
 * @fileoverview Metadata reconciliation hook for comic book metadata.
 * 
 * This module provides a React hook that manages the reconciliation of metadata
 * from multiple sources (ComicVine, Metron, GCD, LOCG, ComicInfo.xml, and inferred).
 * It handles conflict detection, user selections, and derives a canonical record.
 * 
 * @module useReconciler
 */

import { useReducer, useMemo } from "react";
import { isNil, isEmpty } from "lodash";
import { LIBRARY_SERVICE_HOST } from "../../../../../constants/endpoints";
import { escapePoundSymbol } from "../../../../../shared/utils/formatting.utils";

// ═══════════════════════════════════════════════════════════════════════════════
// Source Keys & Labels
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Identifier keys for each metadata source.
 * Used to track provenance of metadata values throughout the reconciliation process.
 */
export type SourceKey =
  | "comicvine"
  | "metron"
  | "gcd"
  | "locg"
  | "comicInfo"
  | "inferredMetadata";

/**
 * Human-readable labels for each metadata source.
 * Used in UI displays to show the origin of metadata values.
 */
export const SOURCE_LABELS = {
  comicvine: "ComicVine",
  metron: "Metron",
  gcd: "Grand Comics Database",
  locg: "League of Comic Geeks",
  comicInfo: "ComicInfo.xml",
  inferredMetadata: "Local File",
} as const satisfies Record<SourceKey, string>;

// ═══════════════════════════════════════════════════════════════════════════════
// Candidate Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Represents a single value candidate from one metadata source.
 * Used for scalar fields where only one value can be selected.
 */
export interface ScalarCandidate {
  /** The metadata source this value came from */
  readonly source: SourceKey;
  /** The string value from this source */
  readonly value: string;
}

/**
 * Represents an item in an array field (e.g., characters, genres, story arcs).
 * Items are pre-selected by default; users may deselect them.
 */
export interface ArrayItem {
  /** Lowercase deduplication key for merging across sources */
  readonly itemKey: string;
  /** Human-readable display value */
  readonly displayValue: string;
  /** Original raw value passed through to the canonical record */
  readonly rawValue: unknown;
  /** The metadata source this item came from */
  readonly source: SourceKey;
  /** Whether this item is selected for inclusion in canonical metadata */
  selected: boolean;
}

/**
 * Represents a creator credit with name and role.
 * Deduplication key is `"${name}:${role}"` (lowercased).
 */
export interface CreditItem {
  /** Lowercase deduplication key in format "name:role" */
  readonly itemKey: string;
  /** Optional identifier from the source */
  readonly id?: string;
  /** Creator's name */
  readonly name: string;
  /** Role (e.g., "Writer", "Artist", "Editor") */
  readonly role: string;
  /** The metadata source this credit came from */
  readonly source: SourceKey;
  /** Whether this credit is selected for inclusion in canonical metadata */
  selected: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Field State Types (Discriminated Union)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * State for a scalar field with potential conflicts.
 * Unresolved when `selectedSource === null` and `userValue` is absent.
 */
interface ScalarFieldState {
  readonly kind: "scalar";
  /** All candidate values from different sources */
  readonly candidates: readonly ScalarCandidate[];
  /** Currently selected source, or null if unresolved */
  selectedSource: SourceKey | null;
  /** User-typed override value; takes precedence over any source value */
  userValue?: string;
}

/**
 * State for an array field containing multiple items.
 */
interface ArrayFieldState {
  readonly kind: "array";
  /** All items from all sources, deduplicated by itemKey */
  readonly items: ArrayItem[];
}

/**
 * State for a credits field containing creator information.
 */
interface CreditsFieldState {
  readonly kind: "credits";
  /** All credits from all sources, deduplicated by itemKey */
  readonly items: CreditItem[];
}

/**
 * State for GTIN (ISBN/UPC) fields with separate selections.
 */
interface GTINFieldState {
  readonly kind: "gtin";
  /** Candidates with ISBN and/or UPC values */
  readonly candidates: ReadonlyArray<{
    source: SourceKey;
    isbn?: string;
    upc?: string;
  }>;
  /** Selected source for ISBN */
  selectedIsbnSource: SourceKey | null;
  /** Selected source for UPC */
  selectedUpcSource: SourceKey | null;
}

/**
 * Discriminated union of all field state types.
 * Use `kind` property to narrow the type.
 */
type FieldState =
  | ScalarFieldState
  | ArrayFieldState
  | CreditsFieldState
  | GTINFieldState;

/**
 * Full reconciler state mapping field names to their state.
 * Contains one entry per field that has data from at least one source.
 */
export type ReconcilerState = Record<string, FieldState>;

// ═══════════════════════════════════════════════════════════════════════════════
// Raw Source Data Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Raw metadata payloads keyed by source, as stored on the comic document.
 * Some fields may arrive as JSON strings and need parsing.
 */
export interface RawSourcedMetadata {
  /** ComicVine metadata object */
  comicvine?: Record<string, unknown>;
  /** Metron metadata (may be JSON string) */
  metron?: unknown;
  /** Grand Comics Database metadata (may be JSON string) */
  gcd?: unknown;
  /** League of Comic Geeks metadata object */
  locg?: Record<string, unknown>;
  /** ComicInfo.xml parsed metadata (may be JSON string) */
  comicInfo?: Record<string, unknown>;
}

/**
 * Metadata inferred from the local file name/path.
 */
export interface RawInferredMetadata {
  issue?: {
    name?: string;
    number?: number;
    year?: string;
    subtitle?: string;
  };
  /** Raw file details for the local comic file, used to surface its cover image. */
  rawFileDetails?: {
    name?: string | null;
    cover?: {
      filePath?: string | null;
    } | null;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Type Guards
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Type guard to check if a value is a non-null object.
 * @param value - Value to check
 * @returns True if value is a non-null object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a field state is scalar.
 * @param state - Field state to check
 * @returns True if state is a ScalarFieldState
 */
function isScalarField(state: FieldState): state is ScalarFieldState {
  return state.kind === "scalar";
}

/**
 * Type guard to check if a field state is array.
 * @param state - Field state to check
 * @returns True if state is an ArrayFieldState
 */
function isArrayField(state: FieldState): state is ArrayFieldState {
  return state.kind === "array";
}

/**
 * Type guard to check if a field state is credits.
 * @param state - Field state to check
 * @returns True if state is a CreditsFieldState
 */
function isCreditsField(state: FieldState): state is CreditsFieldState {
  return state.kind === "credits";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Safely converts a value to a string, returning null for nil or empty values.
 * @param value - Value to convert
 * @returns String representation or null
 */
function safeString(value: unknown): string | null {
  if (isNil(value) || value === "") return null;
  return String(value);
}

/**
 * Extracts a value from an xml2js-parsed object.
 * xml2js with `normalizeTags` wraps every value in a single-element array.
 * @param obj - Parsed XML object
 * @param key - Key to extract
 * @returns String value or null
 */
function xmlVal(obj: Record<string, unknown>, key: string): string | null {
  const arr = obj[key];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return safeString(arr[0]);
}

/**
 * Parses a JSON string if needed, or returns the object as-is.
 * @param value - Value that may be a JSON string or object
 * @returns Parsed object or null
 */
function ensureParsed(value: unknown): Record<string, unknown> | null {
  if (isNil(value)) return null;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return isRecord(value) ? value : null;
}

/**
 * Creates a scalar candidate from a source and value.
 * @param source - Metadata source key
 * @param value - Value to wrap
 * @returns ScalarCandidate or undefined if value is nil/empty
 */
function makeScalarCandidate(
  source: SourceKey,
  value: unknown
): ScalarCandidate | undefined {
  const stringValue = safeString(value);
  if (!stringValue) return undefined;
  return { source, value: stringValue };
}

/**
 * Creates an array item for inclusion in array field state.
 * @param source - Metadata source key
 * @param rawValue - Original value for preservation
 * @param displayValue - Human-readable display value
 * @returns ArrayItem with generated itemKey
 */
function makeArrayItem(
  source: SourceKey,
  rawValue: unknown,
  displayValue: string
): ArrayItem {
  return {
    itemKey: displayValue.toLowerCase().trim(),
    displayValue,
    rawValue,
    source,
    selected: true,
  };
}

/**
 * Creates a credit item for inclusion in credits field state.
 * @param source - Metadata source key
 * @param name - Creator name
 * @param role - Creator role
 * @param id - Optional identifier
 * @returns CreditItem with generated itemKey
 */
function makeCreditItem(
  source: SourceKey,
  name: string,
  role: string,
  id?: string
): CreditItem {
  const safeName = name || "";
  const safeRole = role || "";
  return {
    itemKey: `${safeName.toLowerCase().trim()}:${safeRole.toLowerCase().trim()}`,
    id,
    name: safeName,
    role: safeRole,
    source,
    selected: true,
  };
}

/**
 * Extracts a string from a role that may be a string or an object with a name property.
 * @param role - Role value (string or object)
 * @returns Role name string
 */
function extractRoleName(role: unknown): string {
  if (typeof role === "string") return role;
  if (isRecord(role)) return safeString(role.name) ?? "";
  return "";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Adapter Result Type
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Result type from source adapters.
 * Maps field names to either scalar candidates or arrays of items/credits.
 */
type AdapterResult = Partial<
  Record<string, ScalarCandidate | ArrayItem[] | CreditItem[]>
>;

// ═══════════════════════════════════════════════════════════════════════════════
// Source Adapters
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extracts canonical fields from a ComicVine issue payload.
 * 
 * ComicVine structure:
 * - Volume info lives under `volumeInformation`
 * - Credits under `person_credits`, `character_credits`, etc.
 * - Images under `image` with various size URLs
 * 
 * @param cv - ComicVine metadata object
 * @returns Adapter result with extracted fields
 */
function fromComicVine(cv: Record<string, unknown>): AdapterResult {
  const source: SourceKey = "comicvine";
  const volumeInfo = cv.volumeInformation as Record<string, unknown> | undefined;
  const imageData = cv.image as Record<string, unknown> | undefined;
  const publisher = volumeInfo?.publisher as Record<string, unknown> | undefined;

  const characterCredits = (cv.character_credits as unknown[]) ?? [];
  const teamCredits = (cv.team_credits as unknown[]) ?? [];
  const locationCredits = (cv.location_credits as unknown[]) ?? [];
  const storyArcCredits = (cv.story_arc_credits as unknown[]) ?? [];
  const personCredits = (cv.person_credits as unknown[]) ?? [];

  return {
    title: makeScalarCandidate(source, cv.name),
    series: makeScalarCandidate(source, volumeInfo?.name),
    issueNumber: makeScalarCandidate(source, cv.issue_number),
    volume: makeScalarCandidate(source, volumeInfo?.id),
    description: makeScalarCandidate(source, cv.description),
    publisher: makeScalarCandidate(source, publisher?.name),
    coverDate: makeScalarCandidate(source, cv.cover_date),
    storeDate: makeScalarCandidate(source, cv.store_date),
    coverImage: makeScalarCandidate(
      source,
      imageData?.super_url ?? imageData?.small_url
    ),
    characters: characterCredits
      .filter(isRecord)
      .map((c) => makeArrayItem(source, c, safeString(c.name) ?? "")),
    teams: teamCredits
      .filter(isRecord)
      .map((t) => makeArrayItem(source, t, safeString(t.name) ?? "")),
    locations: locationCredits
      .filter(isRecord)
      .map((l) => makeArrayItem(source, l, safeString(l.name) ?? "")),
    storyArcs: storyArcCredits
      .filter(isRecord)
      .map((a) => makeArrayItem(source, a, safeString(a.name) ?? "")),
    creators: personCredits
      .filter(isRecord)
      .map((p) =>
        makeCreditItem(source, safeString(p.name) ?? "", safeString(p.role) ?? "")
      ),
  };
}

/**
 * Extracts canonical fields from a Metron / MetronInfo payload.
 * 
 * Handles both formats:
 * - MetronInfo XSD schema format (PascalCase: Series.Name, Number, CoverDate)
 * - Metron API response format (camelCase: series.name, issueNumber, cover_date)
 * 
 * @param raw - Metron metadata object
 * @returns Adapter result with extracted fields
 */
function fromMetron(raw: Record<string, unknown>): AdapterResult {
  const source: SourceKey = "metron";

  // Handle both MetronInfo XSD format (PascalCase) and Metron API format (camelCase)
  const series = (raw.Series ?? raw.series ?? raw.seriesInformation) as
    | Record<string, unknown>
    | undefined;
  const issue = raw.issue as Record<string, unknown> | undefined;
  const publisher = (raw.Publisher ?? series?.publisher) as
    | Record<string, unknown>
    | undefined;

  /**
   * Converts an array of objects with name/Name property to ArrayItems.
   */
  const toNamedArrayItems = (arr: unknown[]): ArrayItem[] =>
    arr
      .filter(isRecord)
      .map((x) => makeArrayItem(source, x, safeString(x.name ?? x.Name) ?? ""));

  // Extract values with fallbacks for both formats
  const seriesName = series?.Name ?? series?.name;
  const issueNumber = raw.Number ?? raw.issueNumber ?? issue?.issueNumber;
  const coverDate = raw.CoverDate ?? raw.cover_date ?? issue?.cover_date;
  const storeDate = raw.StoreDate ?? raw.store_date ?? issue?.store_date;
  const description = raw.Summary ?? raw.desc ?? issue?.desc;
  const publisherName = publisher?.Name ?? publisher?.name;
  const coverImage = raw.image ?? issue?.image;
  const title = raw.title ?? issue?.title ?? (raw.Stories as unknown[])?.[0];

  // Process credits from both formats
  const creditsArray = (raw.Credits ?? raw.credits ?? issue?.credits ?? []) as unknown[];
  const creditItems: CreditItem[] = creditsArray.filter(isRecord).flatMap((credit) => {
    // MetronInfo format: Creator object and Roles array
    const creatorObj = credit.Creator as Record<string, unknown> | undefined;
    const rolesArray = (credit.Roles as unknown[]) ?? [];

    if (creatorObj && rolesArray.length > 0) {
      return rolesArray
        .filter((r) => !isNil(r))
        .map((role) =>
          makeCreditItem(
            source,
            safeString(creatorObj.name) ?? "",
            extractRoleName(role),
            safeString(creatorObj.id) ?? undefined
          )
        );
    }

    // API format: creator is string, role is array (of strings or objects)
    const creatorName = safeString(credit.creator);
    const roleArray = (credit.role ?? []) as unknown[];

    if (creatorName && Array.isArray(roleArray) && roleArray.length > 0) {
      return roleArray
        .filter((role) => !isNil(role))
        .map((role) =>
          makeCreditItem(
            source,
            creatorName,
            extractRoleName(role),
            safeString(credit.id) ?? undefined
          )
        );
    }

    return [];
  });

  // Extract array fields
  const characters = (raw.Characters ?? raw.characters ?? issue?.characters ?? []) as unknown[];
  const teams = (raw.Teams ?? raw.teams ?? issue?.teams ?? []) as unknown[];
  const arcs = (raw.Arcs ?? raw.arcs ?? issue?.arcs ?? []) as unknown[];
  const genres = (raw.Genres ?? raw.genres ?? []) as unknown[];
  const tags = (raw.Tags ?? raw.tags ?? []) as unknown[];
  const locations = (raw.Locations ?? raw.locations ?? []) as unknown[];
  const universes = (raw.Universes ?? raw.universes ?? []) as unknown[];
  const stories = (raw.Stories ?? []) as unknown[];
  const reprints = (raw.Reprints ?? raw.reprints ?? issue?.reprints ?? []) as unknown[];

  // Rating and format may be objects with name property
  const rating = raw.rating as Record<string, unknown> | undefined;
  const seriesType = series?.series_type as Record<string, unknown> | undefined;

  return {
    title: makeScalarCandidate(source, title),
    series: makeScalarCandidate(source, seriesName),
    issueNumber: makeScalarCandidate(source, issueNumber),
    collectionTitle: makeScalarCandidate(source, raw.CollectionTitle),
    publisher: makeScalarCandidate(source, publisherName),
    imprint: makeScalarCandidate(source, publisher?.Imprint ?? publisher?.imprint),
    coverDate: makeScalarCandidate(source, coverDate),
    storeDate: makeScalarCandidate(source, storeDate),
    description: makeScalarCandidate(source, description),
    notes: makeScalarCandidate(source, raw.Notes ?? raw.notes),
    ageRating: makeScalarCandidate(source, raw.AgeRating ?? rating?.name),
    pageCount: makeScalarCandidate(
      source,
      raw.PageCount ?? raw.page_count ?? issue?.page_count
    ),
    format: makeScalarCandidate(source, series?.Format ?? seriesType?.name),
    language: makeScalarCandidate(source, series?.lang),
    coverImage: makeScalarCandidate(source, coverImage),
    genres: toNamedArrayItems(genres),
    tags: tags
      .filter((t) => !isNil(t))
      .map((t) => makeArrayItem(source, t, safeString(t) ?? "")),
    characters: toNamedArrayItems(characters),
    teams: toNamedArrayItems(teams),
    locations: toNamedArrayItems(locations),
    universes: universes.filter(isRecord).map((u) =>
      makeArrayItem(
        source,
        u,
        [u.Name ?? u.name, u.Designation ?? u.designation]
          .filter(Boolean)
          .join(" — ")
      )
    ),
    storyArcs: arcs.filter(isRecord).map((a) =>
      makeArrayItem(
        source,
        a,
        [a.Name ?? a.name, (a.Number ?? a.number) ? `#${a.Number ?? a.number}` : null]
          .filter(Boolean)
          .join(" ")
      )
    ),
    stories: stories
      .filter((t) => !isNil(t))
      .map((t) => makeArrayItem(source, t, safeString(t) ?? "")),
    creators: creditItems,
    reprints: reprints
      .filter(isRecord)
      .map((r) => makeArrayItem(source, r, safeString(r.issue ?? r) ?? "")),
    urls:
      raw.URLs ?? raw.resource_url
        ? [raw.resource_url]
            .filter((u) => !isNil(u))
            .map((u) => makeArrayItem(source, u, safeString(u) ?? ""))
        : [],
  };
}

/**
 * Extracts canonical fields from a ComicInfo.xml payload.
 * 
 * Values are xml2js-parsed with `normalizeTags`, meaning each key wraps
 * its value in a single-element array.
 * 
 * @param ci - ComicInfo.xml parsed object
 * @returns Adapter result with extracted fields
 */
function fromComicInfo(ci: Record<string, unknown>): AdapterResult {
  const source: SourceKey = "comicInfo";
  const webUrl = xmlVal(ci, "web");

  const genreItems: ArrayItem[] = (xmlVal(ci, "genre") ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .map((g) => makeArrayItem(source, g, g));

  return {
    series: makeScalarCandidate(source, xmlVal(ci, "series")),
    issueNumber: makeScalarCandidate(source, xmlVal(ci, "number")),
    publisher: makeScalarCandidate(source, xmlVal(ci, "publisher")),
    description: makeScalarCandidate(source, xmlVal(ci, "summary")),
    notes: makeScalarCandidate(source, xmlVal(ci, "notes")),
    pageCount: makeScalarCandidate(source, xmlVal(ci, "pagecount")),
    language: makeScalarCandidate(source, xmlVal(ci, "languageiso")),
    urls: webUrl ? [makeArrayItem(source, webUrl, webUrl)] : [],
    genres: genreItems,
  };
}

/**
 * GCD credit field mappings from raw field names to role names.
 */
const GCD_CREDIT_FIELDS = [
  { key: "script", role: "Writer" },
  { key: "pencils", role: "Penciller" },
  { key: "inks", role: "Inker" },
  { key: "colors", role: "Colorist" },
  { key: "letters", role: "Letterer" },
  { key: "editing", role: "Editor" },
] as const;

/**
 * Splits a GCD free-text credit string into individual names.
 * Names are semicolon-separated; bracketed annotations are stripped.
 * 
 * @param raw - Raw credit string
 * @returns Array of cleaned name strings
 */
function splitGCDCreditString(raw: string): string[] {
  return raw
    .split(/;/)
    .map((name) => name.replace(/\[.*?\]/g, "").trim())
    .filter(Boolean);
}

/**
 * Parsed price information.
 */
interface ParsedPrice {
  amount: number;
  currency: string;
}

/**
 * Parses a GCD price string like "0.10 USD" or "10p".
 * 
 * @param raw - Raw price string
 * @returns Parsed price or null on failure
 */
function parseGCDPrice(raw: string): ParsedPrice | null {
  const match = raw.trim().match(/^([\d.,]+)\s*([A-Z]{2,3}|p|¢|€|£|\$)?/);
  if (!match) return null;

  const amount = parseFloat(match[1].replace(",", "."));
  const currency = match[2] ?? "USD";

  if (Number.isNaN(amount)) return null;
  return { amount, currency };
}

/**
 * Extracts canonical fields from a Grand Comics Database payload.
 * 
 * GCD structure:
 * - Series info under `series` with nested `publisher` and `language`
 * - Stories as an array with credits in free-text fields
 * - Credits split by semicolons with bracketed annotations
 * 
 * @param raw - GCD metadata object
 * @returns Adapter result with extracted fields
 */
function fromGCD(raw: Record<string, unknown>): AdapterResult {
  const source: SourceKey = "gcd";
  const series = raw.series as Record<string, unknown> | undefined;
  const language = series?.language as Record<string, unknown> | undefined;
  const publisher = series?.publisher as Record<string, unknown> | undefined;
  const indiciaPublisher = raw.indicia_publisher as
    | Record<string, unknown>
    | undefined;
  const stories = (raw.stories as Record<string, unknown>[]) ?? [];
  const primaryStory = stories[0] ?? {};

  // Process credits
  const creditItems: CreditItem[] = [];

  if (raw.editing) {
    splitGCDCreditString(String(raw.editing)).forEach((name) =>
      creditItems.push(makeCreditItem(source, name, "Editor"))
    );
  }

  for (const { key, role } of GCD_CREDIT_FIELDS) {
    const value = safeString(primaryStory[key]);
    if (value) {
      splitGCDCreditString(value).forEach((name) =>
        creditItems.push(makeCreditItem(source, name, role))
      );
    }
  }

  // Process genres
  const genreItems: ArrayItem[] = (safeString(primaryStory.genre) ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .map((g) => makeArrayItem(source, g, g));

  // Process characters
  const characterItems: ArrayItem[] = (safeString(primaryStory.characters) ?? "")
    .split(/[;,]/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => makeArrayItem(source, c, c));

  // Process story titles
  const storyTitles: ArrayItem[] = stories
    .map((st) => safeString(st.title))
    .filter((t): t is string => Boolean(t))
    .map((t) => makeArrayItem(source, t, t));

  // Process price
  const priceItems: ArrayItem[] = [];
  const priceStr = safeString(raw.price);
  if (priceStr) {
    const parsed = parseGCDPrice(priceStr);
    if (parsed) {
      priceItems.push(
        makeArrayItem(source, { ...parsed, country: "US" }, priceStr)
      );
    }
  }

  return {
    series: makeScalarCandidate(source, series?.name),
    issueNumber: makeScalarCandidate(source, raw.number),
    title: makeScalarCandidate(source, raw.title ?? primaryStory.title),
    volume: makeScalarCandidate(source, raw.volume),
    publisher: makeScalarCandidate(
      source,
      indiciaPublisher?.name ?? publisher?.name
    ),
    coverDate: makeScalarCandidate(source, raw.publication_date),
    storeDate: makeScalarCandidate(source, raw.on_sale_date ?? raw.key_date),
    pageCount: makeScalarCandidate(source, raw.page_count),
    notes: makeScalarCandidate(source, raw.notes),
    language: makeScalarCandidate(source, language?.code),
    ageRating: makeScalarCandidate(source, raw.rating),
    genres: genreItems,
    characters: characterItems,
    stories: storyTitles,
    creators: creditItems,
    prices: priceItems,
  };
}

/**
 * Extracts canonical fields from a League of Comic Geeks payload.
 * 
 * @param locg - LOCG metadata object
 * @returns Adapter result with extracted fields
 */
function fromLocg(locg: Record<string, unknown>): AdapterResult {
  const source: SourceKey = "locg";
  return {
    title: makeScalarCandidate(source, locg.name),
    publisher: makeScalarCandidate(source, locg.publisher),
    description: makeScalarCandidate(source, locg.description),
    coverImage: makeScalarCandidate(source, locg.cover),
    communityRating: makeScalarCandidate(source, locg.rating),
    publicationDate: makeScalarCandidate(source, locg.publicationDate),
  };
}

/**
 * Extracts canonical fields from inferred metadata (local file analysis).
 *
 * Pulls issue details parsed from the filename, plus the local file's own
 * cover image (built from `rawFileDetails.cover.filePath`) when available.
 *
 * @param inferred - Inferred metadata, including the parsed issue and raw file details
 * @returns Adapter result with extracted fields
 */
function fromInferred(inferred: RawInferredMetadata): AdapterResult {
  const { issue, rawFileDetails } = inferred;
  const source: SourceKey = "inferredMetadata";
  const result: AdapterResult = {};

  if (issue) {
    result.title = makeScalarCandidate(source, issue.name);
    result.issueNumber = makeScalarCandidate(source, issue.number);
    result.volume = makeScalarCandidate(source, issue.year);
  }

  const filePath = rawFileDetails?.cover?.filePath;
  if (filePath) {
    const coverUrl = escapePoundSymbol(
      encodeURI(`${LIBRARY_SERVICE_HOST}${filePath}`)
    );
    result.coverImage = makeScalarCandidate(source, coverUrl);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// State Building
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Merges all adapter results into a ReconcilerState.
 * 
 * - Array and credit items are deduplicated by `itemKey` using a Set
 * - Scalar conflicts are auto-resolved when all sources agree on the same value
 * 
 * @param sources - Map of source keys to their adapter results
 * @returns Built reconciler state
 */
function buildState(
  sources: Partial<Record<SourceKey, AdapterResult>>
): ReconcilerState {
  const state: ReconcilerState = {};
  const scalarMap: Record<string, ScalarCandidate[]> = {};

  for (const adapterResult of Object.values(sources)) {
    if (!adapterResult) continue;

    for (const [field, value] of Object.entries(adapterResult)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        // Presence of `role` distinguishes CreditItem[] from ArrayItem[]
        const isCredits = value.length > 0 && "role" in value[0];

        if (isCredits) {
          const prev = state[field];
          const existing: CreditItem[] =
            prev?.kind === "credits" ? prev.items : [];
          const seen = new Set(existing.map((i) => i.itemKey));
          const merged = [...existing];

          for (const item of value as CreditItem[]) {
            if (!seen.has(item.itemKey)) {
              seen.add(item.itemKey);
              merged.push(item);
            }
          }

          state[field] = { kind: "credits", items: merged };
        } else {
          const prev = state[field];
          const existing: ArrayItem[] = prev?.kind === "array" ? prev.items : [];
          const seen = new Set(existing.map((i) => i.itemKey));
          const merged = [...existing];

          for (const item of value as ArrayItem[]) {
            if (!seen.has(item.itemKey)) {
              seen.add(item.itemKey);
              merged.push(item);
            }
          }

          state[field] = { kind: "array", items: merged };
        }
      } else {
        (scalarMap[field] ??= []).push(value as ScalarCandidate);
      }
    }
  }

  // Process scalar fields and auto-resolve when all sources agree
  for (const [field, candidates] of Object.entries(scalarMap)) {
    const allAgree =
      candidates.length === 1 ||
      candidates.every((c) => c.value === candidates[0].value);

    state[field] = {
      kind: "scalar",
      candidates,
      selectedSource: allAgree ? candidates[0].source : null,
    };
  }

  return state;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Reducer
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Actions that can be dispatched to the reconciler reducer.
 */
type ReconcilerAction =
  | { type: "SELECT_SCALAR"; field: string; source: SourceKey }
  | { type: "SET_USER_VALUE"; field: string; value: string }
  | { type: "TOGGLE_ITEM"; field: string; itemKey: string; selected: boolean }
  | { type: "SET_BASE_SOURCE"; source: SourceKey }
  | { type: "RESET"; initial: ReconcilerState };

/**
 * Reducer for reconciler state management.
 * 
 * @param state - Current state
 * @param action - Action to process
 * @returns New state
 */
function reconcilerReducer(
  state: ReconcilerState,
  action: ReconcilerAction
): ReconcilerState {
  switch (action.type) {
    case "SELECT_SCALAR": {
      const field = state[action.field];
      if (!isScalarField(field)) return state;

      return {
        ...state,
        [action.field]: {
          ...field,
          selectedSource: action.source,
          userValue: undefined,
        },
      };
    }

    case "SET_USER_VALUE": {
      const field = state[action.field];
      if (!isScalarField(field)) return state;

      return {
        ...state,
        [action.field]: {
          ...field,
          selectedSource: null,
          userValue: action.value,
        },
      };
    }

    case "TOGGLE_ITEM": {
      const field = state[action.field];
      if (!isArrayField(field) && !isCreditsField(field)) return state;

      return {
        ...state,
        [action.field]: {
          ...field,
          items: field.items.map((item) =>
            item.itemKey === action.itemKey
              ? { ...item, selected: action.selected }
              : item
          ),
        } as FieldState,
      };
    }

    case "SET_BASE_SOURCE": {
      const next = { ...state };

      for (const [field, fieldState] of Object.entries(next)) {
        if (!isScalarField(fieldState)) continue;
        if (fieldState.candidates.some((c) => c.source === action.source)) {
          next[field] = {
            ...fieldState,
            selectedSource: action.source,
            userValue: undefined,
          };
        }
      }

      return next;
    }

    case "RESET":
      return action.initial;

    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Canonical Record
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Represents a resolved canonical field value with its source.
 */
export interface CanonicalFieldValue {
  /** The resolved value */
  value: unknown;
  /** Source of the value, or "user" for user overrides */
  source: SourceKey | "user";
}

/**
 * The derived canonical record mapping field names to resolved values.
 */
export type CanonicalRecord = Partial<Record<string, CanonicalFieldValue>>;

/**
 * Derives a canonical record from the current reconciler state.
 * 
 * - Scalar fields use user value if present, otherwise selected source
 * - Array fields include all selected items
 * - Credits include all selected credit items
 * 
 * @param state - Current reconciler state
 * @returns Derived canonical record
 */
function deriveCanonicalRecord(state: ReconcilerState): CanonicalRecord {
  const record: CanonicalRecord = {};

  for (const [field, fieldState] of Object.entries(state)) {
    if (isScalarField(fieldState)) {
      if (fieldState.userValue !== undefined) {
        record[field] = { value: fieldState.userValue, source: "user" };
      } else if (fieldState.selectedSource !== null) {
        const candidate = fieldState.candidates.find(
          (c) => c.source === fieldState.selectedSource
        );
        if (candidate) {
          record[field] = { value: candidate.value, source: candidate.source };
        }
      }
    } else if (isArrayField(fieldState)) {
      const selected = fieldState.items.filter((i) => i.selected);
      if (selected.length > 0) {
        // Determine dominant source by count
        const counts = selected.reduce<Record<string, number>>((acc, i) => {
          acc[i.source] = (acc[i.source] ?? 0) + 1;
          return acc;
        }, {});
        const dominant = Object.entries(counts).sort(
          ([, a], [, b]) => b - a
        )[0][0] as SourceKey;

        record[field] = {
          value: selected.map((i) => i.rawValue),
          source: dominant,
        };
      }
    } else if (isCreditsField(fieldState)) {
      const selected = fieldState.items.filter((i) => i.selected);
      if (selected.length > 0) {
        record[field] = { value: selected, source: selected[0].source };
      }
    }
  }

  return record;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Result returned by the useReconciler hook.
 */
export interface UseReconcilerResult {
  /** Current reconciler state */
  state: ReconcilerState;
  /** Number of scalar fields with unresolved conflicts */
  unresolvedCount: number;
  /** True if any field has candidates from more than one source */
  hasConflicts: boolean;
  /** Derived canonical record based on current selections */
  canonicalRecord: CanonicalRecord;
  /** Select a source for a scalar field */
  selectScalar: (field: string, source: SourceKey) => void;
  /** Override a scalar field with a user-typed value */
  setUserValue: (field: string, value: string) => void;
  /** Toggle selection of an item in an array/credits field */
  toggleItem: (field: string, itemKey: string, selected: boolean) => void;
  /** Adopt all available fields from a single source */
  setBaseSource: (source: SourceKey) => void;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * React hook for metadata reconciliation.
 * 
 * Manages the reconciliation of metadata from multiple sources, handling
 * conflict detection, user selections, and deriving a canonical record.
 * 
 * @param sourcedMetadata - Raw metadata from various sources
 * @param inferredMetadata - Optional metadata inferred from the file
 * @returns Reconciler state and actions
 * 
 * @example
 * ```tsx
 * const { state, canonicalRecord, selectScalar, hasConflicts } = useReconciler(
 *   comic.sourcedMetadata,
 *   comic.inferredMetadata
 * );
 * 
 * if (hasConflicts) {
 *   // Show conflict resolution UI
 * }
 * ```
 */
export function useReconciler(
  sourcedMetadata: RawSourcedMetadata,
  inferredMetadata?: RawInferredMetadata
): UseReconcilerResult {
  // Build initial state from all sources
  const initial = useMemo(() => {
    const adapters: Partial<Record<SourceKey, AdapterResult>> = {};

    if (!isEmpty(sourcedMetadata.comicvine)) {
      adapters.comicvine = fromComicVine(
        sourcedMetadata.comicvine as Record<string, unknown>
      );
    }

    const metron = ensureParsed(sourcedMetadata.metron);
    if (metron) {
      adapters.metron = fromMetron(metron);
    }

    const gcd = ensureParsed(sourcedMetadata.gcd);
    if (gcd) {
      adapters.gcd = fromGCD(gcd);
    }

    if (!isEmpty(sourcedMetadata.locg)) {
      adapters.locg = fromLocg(sourcedMetadata.locg as Record<string, unknown>);
    }

    const comicInfo = ensureParsed(sourcedMetadata.comicInfo);
    if (comicInfo) {
      adapters.comicInfo = fromComicInfo(comicInfo);
    }

    if (inferredMetadata?.issue || inferredMetadata?.rawFileDetails?.cover?.filePath) {
      adapters.inferredMetadata = fromInferred(inferredMetadata);
    }

    return buildState(adapters);
  }, [sourcedMetadata, inferredMetadata]);

  const [state, dispatch] = useReducer(reconcilerReducer, initial);

  // Count unresolved scalar conflicts
  const unresolvedCount = useMemo(
    () =>
      Object.values(state).filter(
        (f) =>
          isScalarField(f) &&
          f.selectedSource === null &&
          f.userValue === undefined &&
          f.candidates.length > 1
      ).length,
    [state]
  );

  // Check if any field has multiple sources
  const hasConflicts = useMemo(
    () =>
      Object.values(state).some((f) => {
        if (isScalarField(f)) {
          return f.candidates.length > 1;
        }
        if (isArrayField(f) || isCreditsField(f)) {
          return new Set(f.items.map((i) => i.source)).size > 1;
        }
        return false;
      }),
    [state]
  );

  // Derive canonical record from current state
  const canonicalRecord = useMemo(() => deriveCanonicalRecord(state), [state]);

  return {
    state,
    unresolvedCount,
    hasConflicts,
    canonicalRecord,
    selectScalar: (field, source) =>
      dispatch({ type: "SELECT_SCALAR", field, source }),
    setUserValue: (field, value) =>
      dispatch({ type: "SET_USER_VALUE", field, value }),
    toggleItem: (field, itemKey, selected) =>
      dispatch({ type: "TOGGLE_ITEM", field, itemKey, selected }),
    setBaseSource: (source) => dispatch({ type: "SET_BASE_SOURCE", source }),
    reset: () => dispatch({ type: "RESET", initial }),
  };
}
