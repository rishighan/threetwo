import { useReducer, useMemo } from "react";
import { isNil, isEmpty } from "lodash";

// ── Source keys ────────────────────────────────────────────────────────────────

export type SourceKey =
  | "comicvine"
  | "metron"
  | "gcd"
  | "locg"
  | "comicInfo"
  | "inferredMetadata";

export const SOURCE_LABELS: Record<SourceKey, string> = {
  comicvine: "ComicVine",
  metron: "Metron",
  gcd: "Grand Comics Database",
  locg: "League of Comic Geeks",
  comicInfo: "ComicInfo.xml",
  inferredMetadata: "Local File",
};

// ── Candidate types ────────────────────────────────────────────────────────────

/** One source's value for a scalar field. Multiple candidates for the same field = conflict. */
export interface ScalarCandidate {
  source: SourceKey;
  value: string;
}

/** One item in an array field (characters, genres, arcs…). Pre-selected; user may deselect. */
export interface ArrayItem {
  /** Lowercase dedup key. */
  itemKey: string;
  displayValue: string;
  /** Raw value passed through to the canonical record. */
  rawValue: unknown;
  source: SourceKey;
  selected: boolean;
}

/** One person credit. Dedup key is `"${name}:${role}"` (lowercased). */
export interface CreditItem {
  itemKey: string;
  id?: string;
  name: string;
  role: string;
  source: SourceKey;
  selected: boolean;
}

// ── Per-field state ────────────────────────────────────────────────────────────

/** Unresolved when `selectedSource === null` and `userValue` is absent. */
interface ScalarFieldState {
  kind: "scalar";
  candidates: ScalarCandidate[];
  selectedSource: SourceKey | null;
  /** User-typed override; takes precedence over any source value. */
  userValue?: string;
}

interface ArrayFieldState {
  kind: "array";
  items: ArrayItem[];
}

interface CreditsFieldState {
  kind: "credits";
  items: CreditItem[];
}

interface GTINFieldState {
  kind: "gtin";
  candidates: Array<{ source: SourceKey; isbn?: string; upc?: string }>;
  selectedIsbnSource: SourceKey | null;
  selectedUpcSource: SourceKey | null;
}

type FieldState = ScalarFieldState | ArrayFieldState | CreditsFieldState | GTINFieldState;

/** Full reconciler state — one entry per field that has data from at least one source. */
export type ReconcilerState = Record<string, FieldState>;

// ── Raw source data ────────────────────────────────────────────────────────────

/** Raw metadata payloads keyed by source, as stored on the comic document. */
export interface RawSourcedMetadata {
  comicvine?: Record<string, unknown>;
  /** May arrive as a JSON string; normalised by `ensureParsed`. */
  metron?: unknown;
  /** May arrive as a JSON string; normalised by `ensureParsed`. */
  gcd?: unknown;
  locg?: Record<string, unknown>;
  /** May arrive as a JSON string; normalised by `ensureParsed`. */
  comicInfo?: Record<string, unknown>;
}

/** Metadata inferred from the local file name / path. */
export interface RawInferredMetadata {
  issue?: {
    name?: string;
    number?: number;
    year?: string;
    subtitle?: string;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function safeString(v: unknown): string | null {
  if (isNil(v) || v === "") return null;
  return String(v);
}

/** xml2js with `normalizeTags` wraps every value in a single-element array. */
function xmlVal(obj: Record<string, unknown>, key: string): string | null {
  const arr = obj[key];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return safeString(arr[0]);
}

/** Parse a JSON string if it hasn't been parsed yet. */
function ensureParsed(v: unknown): Record<string, unknown> | null {
  if (isNil(v)) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  if (typeof v === "object") return v as Record<string, unknown>;
  return null;
}

function makeScalarCandidate(
  source: SourceKey,
  value: unknown,
): ScalarCandidate | undefined {
  const val = safeString(value);
  return val ? { source, value: val } : undefined;
}

function makeArrayItem(
  source: SourceKey,
  rawValue: unknown,
  displayValue: string,
): ArrayItem {
  return {
    itemKey: displayValue.toLowerCase().trim(),
    displayValue,
    rawValue,
    source,
    selected: true,
  };
}

function makeCreditItem(
  source: SourceKey,
  name: string,
  role: string,
  id?: string,
): CreditItem {
  return {
    itemKey: `${name.toLowerCase().trim()}:${role.toLowerCase().trim()}`,
    id,
    name,
    role,
    source,
    selected: true,
  };
}

// ── Source adapters ────────────────────────────────────────────────────────────

type AdapterResult = Partial<Record<string, ScalarCandidate | ArrayItem[] | CreditItem[]>>;

/**
 * Extract canonical fields from a ComicVine issue payload.
 * Volume info lives under `volumeInformation`; credits under `person_credits` etc.
 */
function fromComicVine(cv: Record<string, unknown>): AdapterResult {
  const s: SourceKey = "comicvine";
  const vi = cv.volumeInformation as Record<string, unknown> | undefined;
  const img = cv.image as Record<string, unknown> | undefined;
  const publisher = vi?.publisher as Record<string, unknown> | undefined;

  return {
    title: makeScalarCandidate(s, cv.name),
    series: makeScalarCandidate(s, vi?.name),
    issueNumber: makeScalarCandidate(s, cv.issue_number),
    volume: makeScalarCandidate(s, vi?.id),
    description: makeScalarCandidate(s, cv.description),
    publisher: makeScalarCandidate(s, publisher?.name),
    coverDate: makeScalarCandidate(s, cv.cover_date),
    storeDate: makeScalarCandidate(s, cv.store_date),
    coverImage: makeScalarCandidate(s, img?.super_url ?? img?.small_url),
    characters: ((cv.character_credits as unknown[]) ?? [])
      .filter((c): c is Record<string, unknown> => !isNil(c))
      .map((c) => makeArrayItem(s, c, safeString(c.name) ?? "")),
    teams: ((cv.team_credits as unknown[]) ?? [])
      .filter((t): t is Record<string, unknown> => !isNil(t))
      .map((t) => makeArrayItem(s, t, safeString(t.name) ?? "")),
    locations: ((cv.location_credits as unknown[]) ?? [])
      .filter((l): l is Record<string, unknown> => !isNil(l))
      .map((l) => makeArrayItem(s, l, safeString(l.name) ?? "")),
    storyArcs: ((cv.story_arc_credits as unknown[]) ?? [])
      .filter((a): a is Record<string, unknown> => !isNil(a))
      .map((a) => makeArrayItem(s, a, safeString(a.name) ?? "")),
    creators: ((cv.person_credits as unknown[]) ?? [])
      .filter((p): p is Record<string, unknown> => !isNil(p))
      .map((p) =>
        makeCreditItem(s, safeString(p.name) ?? "", safeString(p.role) ?? ""),
      ),
  };
}

/**
 * Extract canonical fields from a Metron / MetronInfo payload.
 * Keys are PascalCase mirroring the MetronInfo XSD schema.
 */
function fromMetron(raw: Record<string, unknown>): AdapterResult {
  const s: SourceKey = "metron";
  const series = raw.Series as Record<string, unknown> | undefined;
  const pub = raw.Publisher as Record<string, unknown> | undefined;

  const nameList = (arr: unknown[]): ArrayItem[] =>
    arr
      .filter((x): x is Record<string, unknown> => !isNil(x))
      .map((x) => makeArrayItem(s, x, safeString(x.name) ?? ""));

  return {
    title: makeScalarCandidate(s, (raw.Stories as unknown[])?.[0]),
    series: makeScalarCandidate(s, series?.Name),
    issueNumber: makeScalarCandidate(s, raw.Number),
    collectionTitle: makeScalarCandidate(s, raw.CollectionTitle),
    publisher: makeScalarCandidate(s, pub?.Name),
    imprint: makeScalarCandidate(s, pub?.Imprint),
    coverDate: makeScalarCandidate(s, raw.CoverDate),
    storeDate: makeScalarCandidate(s, raw.StoreDate),
    description: makeScalarCandidate(s, raw.Summary),
    notes: makeScalarCandidate(s, raw.Notes),
    ageRating: makeScalarCandidate(s, raw.AgeRating),
    pageCount: makeScalarCandidate(s, raw.PageCount),
    format: makeScalarCandidate(s, series?.Format),
    language: makeScalarCandidate(s, series?.lang),
    genres: nameList((raw.Genres as unknown[]) ?? []),
    tags: ((raw.Tags as unknown[]) ?? [])
      .filter((t) => !isNil(t))
      .map((t) => makeArrayItem(s, t, safeString(t) ?? "")),
    characters: nameList((raw.Characters as unknown[]) ?? []),
    teams: nameList((raw.Teams as unknown[]) ?? []),
    locations: nameList((raw.Locations as unknown[]) ?? []),
    universes: ((raw.Universes as unknown[]) ?? [])
      .filter((u): u is Record<string, unknown> => !isNil(u))
      .map((u) =>
        makeArrayItem(
          s,
          u,
          [u.Name, u.Designation].filter(Boolean).join(" — "),
        ),
      ),
    storyArcs: ((raw.Arcs as unknown[]) ?? [])
      .filter((a): a is Record<string, unknown> => !isNil(a))
      .map((a) =>
        makeArrayItem(
          s,
          a,
          [a.Name, a.Number ? `#${a.Number}` : null].filter(Boolean).join(" "),
        ),
      ),
    stories: ((raw.Stories as unknown[]) ?? [])
      .filter((t) => !isNil(t))
      .map((t) => makeArrayItem(s, t, safeString(t) ?? "")),
    creators: ((raw.Credits as unknown[]) ?? [])
      .filter((c): c is Record<string, unknown> => !isNil(c))
      .flatMap((c) => {
        const creator = c.Creator as Record<string, unknown> | undefined;
        const roles = (c.Roles as unknown[]) ?? [];
        return roles
          .filter((r): r is Record<string, unknown> => !isNil(r))
          .map((r) =>
            makeCreditItem(
              s,
              safeString(creator?.name) ?? "",
              safeString(r.name ?? r) ?? "",
              safeString(creator?.id) ?? undefined,
            ),
          );
      }),
    reprints: ((raw.Reprints as unknown[]) ?? [])
      .filter((r) => !isNil(r))
      .map((r) => makeArrayItem(s, r, safeString(r) ?? "")),
    urls: ((raw.URLs as unknown[]) ?? [])
      .filter((u) => !isNil(u))
      .map((u) => makeArrayItem(s, u, safeString(u) ?? "")),
  };
}

/**
 * Extract canonical fields from a ComicInfo.xml payload.
 * Values are xml2js-parsed with `normalizeTags` (each key wraps its value in a single-element array).
 * Genre is a comma-separated string; the web URL maps to `urls`.
 */
function fromComicInfo(ci: Record<string, unknown>): AdapterResult {
  const s: SourceKey = "comicInfo";
  const webUrl = xmlVal(ci, "web");
  const genreItems: ArrayItem[] = (xmlVal(ci, "genre") ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .map((g) => makeArrayItem(s, g, g));

  return {
    series: makeScalarCandidate(s, xmlVal(ci, "series")),
    issueNumber: makeScalarCandidate(s, xmlVal(ci, "number")),
    publisher: makeScalarCandidate(s, xmlVal(ci, "publisher")),
    description: makeScalarCandidate(s, xmlVal(ci, "summary")),
    notes: makeScalarCandidate(s, xmlVal(ci, "notes")),
    pageCount: makeScalarCandidate(s, xmlVal(ci, "pagecount")),
    language: makeScalarCandidate(s, xmlVal(ci, "languageiso")),
    urls: webUrl ? [makeArrayItem(s, webUrl, webUrl)] : [],
    genres: genreItems,
  };
}

/** GCD free-text credit fields: field key → role name. */
const GCD_CREDIT_FIELDS: Array<{ key: string; role: string }> = [
  { key: "script", role: "Writer" },
  { key: "pencils", role: "Penciller" },
  { key: "inks", role: "Inker" },
  { key: "colors", role: "Colorist" },
  { key: "letters", role: "Letterer" },
  { key: "editing", role: "Editor" },
];

/** Split a GCD free-text credit string (semicolon-separated; strips bracketed annotations). */
function splitGCDCreditString(raw: string): string[] {
  return raw
    .split(/;/)
    .map((name) => name.replace(/\[.*?\]/g, "").trim())
    .filter(Boolean);
}

/** Parse a GCD price string like "0.10 USD" or "10p". Returns null on failure. */
function parseGCDPrice(
  raw: string,
): { amount: number; currency: string } | null {
  const match = raw.trim().match(/^([\d.,]+)\s*([A-Z]{2,3}|p|¢|€|£|\$)?/);
  if (!match) return null;
  const amount = parseFloat(match[1].replace(",", "."));
  const currency = match[2] ?? "USD";
  if (isNaN(amount)) return null;
  return { amount, currency };
}

function fromGCD(raw: Record<string, unknown>): AdapterResult {
  const s: SourceKey = "gcd";
  const series = raw.series as Record<string, unknown> | undefined;
  const language = series?.language as Record<string, unknown> | undefined;
  const publisher = series?.publisher as Record<string, unknown> | undefined;
  const indiciaPublisher = raw.indicia_publisher as
    | Record<string, unknown>
    | undefined;
  const stories = (raw.stories as Record<string, unknown>[]) ?? [];
  const primaryStory = stories[0] ?? {};

  const creditItems: CreditItem[] = [];
  if (raw.editing) {
    splitGCDCreditString(String(raw.editing)).forEach((name) =>
      creditItems.push(makeCreditItem(s, name, "Editor")),
    );
  }
  GCD_CREDIT_FIELDS.forEach(({ key, role }) => {
    const val = safeString(primaryStory[key]);
    if (!val) return;
    splitGCDCreditString(val).forEach((name) =>
      creditItems.push(makeCreditItem(s, name, role)),
    );
  });

  const genreItems: ArrayItem[] = (safeString(primaryStory.genre) ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .map((g) => makeArrayItem(s, g, g));

  const characterItems: ArrayItem[] = (
    safeString(primaryStory.characters) ?? ""
  )
    .split(/[;,]/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => makeArrayItem(s, c, c));

  const storyTitles: ArrayItem[] = stories
    .map((st) => safeString(st.title))
    .filter((t): t is string => Boolean(t))
    .map((t) => makeArrayItem(s, t, t));

  const priceItems: ArrayItem[] = [];
  const priceStr = safeString(raw.price);
  if (priceStr) {
    const parsed = parseGCDPrice(priceStr);
    if (parsed) {
      priceItems.push(makeArrayItem(s, { ...parsed, country: "US" }, priceStr));
    }
  }

  return {
    series: makeScalarCandidate(s, series?.name),
    issueNumber: makeScalarCandidate(s, raw.number),
    title: makeScalarCandidate(s, raw.title ?? primaryStory.title),
    volume: makeScalarCandidate(s, raw.volume),
    // Prefer indicia publisher (as-printed) over series publisher
    publisher: makeScalarCandidate(s, indiciaPublisher?.name ?? publisher?.name),
    coverDate: makeScalarCandidate(s, raw.publication_date),
    storeDate: makeScalarCandidate(s, raw.on_sale_date ?? raw.key_date),
    pageCount: makeScalarCandidate(s, raw.page_count),
    notes: makeScalarCandidate(s, raw.notes),
    language: makeScalarCandidate(s, language?.code),
    ageRating: makeScalarCandidate(s, raw.rating),
    genres: genreItems,
    characters: characterItems,
    stories: storyTitles,
    creators: creditItems,
    prices: priceItems,
  };
}

function fromLocg(locg: Record<string, unknown>): AdapterResult {
  const s: SourceKey = "locg";
  return {
    title: makeScalarCandidate(s, locg.name),
    publisher: makeScalarCandidate(s, locg.publisher),
    description: makeScalarCandidate(s, locg.description),
    coverImage: makeScalarCandidate(s, locg.cover),
    communityRating: makeScalarCandidate(s, locg.rating),
    publicationDate: makeScalarCandidate(s, locg.publicationDate),
  };
}

function fromInferred(inf: RawInferredMetadata["issue"]): AdapterResult {
  if (!inf) return {};
  const s: SourceKey = "inferredMetadata";
  return {
    title: makeScalarCandidate(s, inf.name),
    issueNumber: makeScalarCandidate(s, inf.number),
    volume: makeScalarCandidate(s, inf.year),
  };
}

// ── State building ─────────────────────────────────────────────────────────────

/**
 * Merge all adapter results directly into a `ReconcilerState`.
 * Array and credit items are deduplicated by `itemKey` using a Set (O(n)).
 * Scalar conflicts are auto-resolved when all sources agree on the same value.
 */
function buildState(
  sources: Partial<Record<SourceKey, AdapterResult>>,
): ReconcilerState {
  const state: ReconcilerState = {};
  const scalarMap: Record<string, ScalarCandidate[]> = {};

  for (const adapterResult of Object.values(sources)) {
    if (!adapterResult) continue;
    for (const [field, value] of Object.entries(adapterResult)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        // Presence of `role` distinguishes CreditItem[] from ArrayItem[].
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
          const existing: ArrayItem[] =
            prev?.kind === "array" ? prev.items : [];
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

// ── Reducer ────────────────────────────────────────────────────────────────────

type Action =
  | { type: "SELECT_SCALAR"; field: string; source: SourceKey }
  | { type: "SET_USER_VALUE"; field: string; value: string }
  | { type: "TOGGLE_ITEM"; field: string; itemKey: string; selected: boolean }
  | { type: "SET_BASE_SOURCE"; source: SourceKey }
  | { type: "RESET"; initial: ReconcilerState };

function reducer(state: ReconcilerState, action: Action): ReconcilerState {
  switch (action.type) {
    case "SELECT_SCALAR": {
      const field = state[action.field];
      if (field?.kind !== "scalar") return state;
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
      if (field?.kind !== "scalar") return state;
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
      if (field?.kind === "array" || field?.kind === "credits") {
        return {
          ...state,
          [action.field]: {
            ...field,
            items: field.items.map((item) =>
              item.itemKey === action.itemKey
                ? { ...item, selected: action.selected }
                : item,
            ),
          } as FieldState,
        };
      }
      return state;
    }

    case "SET_BASE_SOURCE": {
      const next = { ...state };
      for (const [field, fieldState] of Object.entries(next)) {
        if (fieldState.kind !== "scalar") continue;
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

// ── Canonical record ───────────────────────────────────────────────────────────

export interface CanonicalFieldValue {
  value: unknown;
  source: SourceKey | "user";
}

export type CanonicalRecord = Partial<Record<string, CanonicalFieldValue>>;

function deriveCanonicalRecord(state: ReconcilerState): CanonicalRecord {
  const record: CanonicalRecord = {};

  for (const [field, fieldState] of Object.entries(state)) {
    if (fieldState.kind === "scalar") {
      if (fieldState.userValue !== undefined) {
        record[field] = { value: fieldState.userValue, source: "user" };
      } else if (fieldState.selectedSource !== null) {
        const candidate = fieldState.candidates.find(
          (c) => c.source === fieldState.selectedSource,
        );
        if (candidate) {
          record[field] = { value: candidate.value, source: candidate.source };
        }
      }
    } else if (fieldState.kind === "array") {
      const selected = fieldState.items.filter((i) => i.selected);
      if (selected.length > 0) {
        const counts = selected.reduce<Record<string, number>>((acc, i) => {
          acc[i.source] = (acc[i.source] ?? 0) + 1;
          return acc;
        }, {});
        const dominant = Object.entries(counts).sort(
          ([, a], [, b]) => b - a,
        )[0][0] as SourceKey;
        record[field] = {
          value: selected.map((i) => i.rawValue),
          source: dominant,
        };
      }
    } else if (fieldState.kind === "credits") {
      const selected = fieldState.items.filter((i) => i.selected);
      if (selected.length > 0) {
        record[field] = { value: selected, source: selected[0].source };
      }
    }
  }

  return record;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface UseReconcilerResult {
  state: ReconcilerState;
  /** Number of scalar fields with a conflict that has no selection yet. */
  unresolvedCount: number;
  /** True if any field has candidates from more than one source. */
  hasConflicts: boolean;
  canonicalRecord: CanonicalRecord;
  selectScalar: (field: string, source: SourceKey) => void;
  /** Override a scalar field with a user-typed value. */
  setUserValue: (field: string, value: string) => void;
  toggleItem: (field: string, itemKey: string, selected: boolean) => void;
  /** Adopt all available fields from a single source. */
  setBaseSource: (source: SourceKey) => void;
  reset: () => void;
}

export function useReconciler(
  sourcedMetadata: RawSourcedMetadata,
  inferredMetadata?: RawInferredMetadata,
): UseReconcilerResult {
  const initial = useMemo(() => {
    const adapters: Partial<Record<SourceKey, AdapterResult>> = {};

    if (!isEmpty(sourcedMetadata.comicvine)) {
      adapters.comicvine = fromComicVine(
        sourcedMetadata.comicvine as Record<string, unknown>,
      );
    }
    const metron = ensureParsed(sourcedMetadata.metron);
    if (metron) adapters.metron = fromMetron(metron);

    const gcd = ensureParsed(sourcedMetadata.gcd);
    if (gcd) adapters.gcd = fromGCD(gcd);

    if (!isEmpty(sourcedMetadata.locg)) {
      adapters.locg = fromLocg(
        sourcedMetadata.locg as Record<string, unknown>,
      );
    }
    const ci = ensureParsed(sourcedMetadata.comicInfo);
    if (ci) adapters.comicInfo = fromComicInfo(ci);

    if (inferredMetadata?.issue) {
      adapters.inferredMetadata = fromInferred(inferredMetadata.issue);
    }

    return buildState(adapters);
  }, [sourcedMetadata, inferredMetadata]);

  const [state, dispatch] = useReducer(reducer, initial);

  const unresolvedCount = useMemo(
    () =>
      Object.values(state).filter(
        (f) =>
          f.kind === "scalar" &&
          f.selectedSource === null &&
          f.userValue === undefined &&
          f.candidates.length > 1,
      ).length,
    [state],
  );

  const hasConflicts = useMemo(
    () =>
      Object.values(state).some(
        (f) =>
          (f.kind === "scalar" && f.candidates.length > 1) ||
          ((f.kind === "array" || f.kind === "credits") &&
            new Set(
              (f.items as Array<ArrayItem | CreditItem>).map((i) => i.source),
            ).size > 1),
      ),
    [state],
  );

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
    setBaseSource: (source) =>
      dispatch({ type: "SET_BASE_SOURCE", source }),
    reset: () => dispatch({ type: "RESET", initial }),
  };
}
