/**
 * UI field configuration for the metadata reconciler.
 *
 * Each entry maps a CanonicalMetadata field key to:
 *   - label        Display name shown in the reconciler table
 *   - group        Which section the field belongs to
 *   - renderAs     How the field's cell is rendered (drives component selection)
 *   - comicInfoKey The ComicInfo.xml v1 key this field exports to, or null if
 *                  the field has no v1 equivalent (shown with a badge in the UI)
 *
 * The order of entries within each group controls row order in the table.
 */

export type RenderType =
  | "scalar"      // Single string/number — click to select
  | "date"        // ISO date string — click to select
  | "longtext"    // Multi-line text — click to select, expandable preview
  | "image"       // Cover image — thumbnail grid picker
  | "array"       // Flat list of strings with source badges
  | "arcs"        // [{name, number}] — arc name + position number
  | "universes"   // [{name, designation}] — universe name + designation
  | "credits"     // [{name, role}] — role-grouped, toggleable list
  | "seriesInfo"  // Structured series object — rendered as sub-fields
  | "prices"      // [{country, amount, currency}]
  | "gtin"        // {isbn, upc}
  | "reprints"    // [{description}]
  | "urls"        // [{url, primary}]
  | "externalIDs" // [{source, externalId, primary}]

export type FieldGroup =
  | "Identity"
  | "Series"
  | "Publication"
  | "Content"
  | "Credits"
  | "Classification"
  | "Physical"
  | "Commercial"
  | "External"

/** Ordered list of groups — controls section order in the reconciler table. */
export const FIELD_GROUPS: FieldGroup[] = [
  "Identity",
  "Series",
  "Publication",
  "Content",
  "Credits",
  "Classification",
  "Physical",
  "Commercial",
  "External",
]

export interface FieldConfig {
  label: string
  group: FieldGroup
  renderAs: RenderType
  /**
   * ComicInfo.xml v1 key this field maps to on export.
   * null means the field is not exported to ComicInfo v1.
   */
  comicInfoKey: string | null
}

/**
 * Master field registry for the reconciler.
 * Keys match CanonicalMetadata field names from the core-service GraphQL schema.
 */
export const FIELD_CONFIG: Record<string, FieldConfig> = {
  // ── Identity ──────────────────────────────────────────────────────────────
  title: {
    label: "Title",
    group: "Identity",
    renderAs: "scalar",
    comicInfoKey: null,
  },
  series: {
    label: "Series",
    group: "Identity",
    renderAs: "scalar",
    comicInfoKey: "series",
  },
  issueNumber: {
    label: "Issue Number",
    group: "Identity",
    renderAs: "scalar",
    comicInfoKey: "number",
  },
  volume: {
    label: "Volume",
    group: "Identity",
    renderAs: "scalar",
    comicInfoKey: null,
  },
  collectionTitle: {
    label: "Collection Title",
    group: "Identity",
    renderAs: "scalar",
    comicInfoKey: null,
  },

  // ── Series ────────────────────────────────────────────────────────────────
  seriesInfo: {
    label: "Series Info",
    group: "Series",
    renderAs: "seriesInfo",
    comicInfoKey: null,
  },

  // ── Publication ───────────────────────────────────────────────────────────
  publisher: {
    label: "Publisher",
    group: "Publication",
    renderAs: "scalar",
    comicInfoKey: "publisher",
  },
  imprint: {
    label: "Imprint",
    group: "Publication",
    renderAs: "scalar",
    comicInfoKey: null,
  },
  coverDate: {
    label: "Cover Date",
    group: "Publication",
    renderAs: "date",
    comicInfoKey: null,
  },
  storeDate: {
    label: "Store Date",
    group: "Publication",
    renderAs: "date",
    comicInfoKey: null,
  },
  publicationDate: {
    label: "Publication Date",
    group: "Publication",
    renderAs: "date",
    comicInfoKey: null,
  },
  language: {
    label: "Language",
    group: "Publication",
    renderAs: "scalar",
    comicInfoKey: "languageiso",
  },

  // ── Content ───────────────────────────────────────────────────────────────
  description: {
    label: "Description",
    group: "Content",
    renderAs: "longtext",
    comicInfoKey: "summary",
  },
  notes: {
    label: "Notes",
    group: "Content",
    renderAs: "longtext",
    comicInfoKey: "notes",
  },
  stories: {
    label: "Stories",
    group: "Content",
    renderAs: "array",
    comicInfoKey: null,
  },
  storyArcs: {
    label: "Story Arcs",
    group: "Content",
    renderAs: "arcs",
    comicInfoKey: null,
  },
  characters: {
    label: "Characters",
    group: "Content",
    renderAs: "array",
    comicInfoKey: null,
  },
  teams: {
    label: "Teams",
    group: "Content",
    renderAs: "array",
    comicInfoKey: null,
  },
  locations: {
    label: "Locations",
    group: "Content",
    renderAs: "array",
    comicInfoKey: null,
  },
  universes: {
    label: "Universes",
    group: "Content",
    renderAs: "universes",
    comicInfoKey: null,
  },
  coverImage: {
    label: "Cover Image",
    group: "Content",
    renderAs: "image",
    comicInfoKey: null,
  },

  // ── Credits ───────────────────────────────────────────────────────────────
  creators: {
    label: "Credits",
    group: "Credits",
    renderAs: "credits",
    comicInfoKey: null,
  },

  // ── Classification ────────────────────────────────────────────────────────
  genres: {
    label: "Genres",
    group: "Classification",
    renderAs: "array",
    comicInfoKey: "genre",
  },
  tags: {
    label: "Tags",
    group: "Classification",
    renderAs: "array",
    comicInfoKey: null,
  },
  ageRating: {
    label: "Age Rating",
    group: "Classification",
    renderAs: "scalar",
    comicInfoKey: null,
  },

  // ── Physical ──────────────────────────────────────────────────────────────
  pageCount: {
    label: "Page Count",
    group: "Physical",
    renderAs: "scalar",
    comicInfoKey: "pagecount",
  },
  format: {
    label: "Format",
    group: "Physical",
    renderAs: "scalar",
    comicInfoKey: null,
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  prices: {
    label: "Prices",
    group: "Commercial",
    renderAs: "prices",
    comicInfoKey: null,
  },
  gtin: {
    label: "ISBN / UPC",
    group: "Commercial",
    renderAs: "gtin",
    comicInfoKey: null,
  },
  reprints: {
    label: "Reprints",
    group: "Commercial",
    renderAs: "reprints",
    comicInfoKey: null,
  },
  communityRating: {
    label: "Community Rating",
    group: "Commercial",
    renderAs: "scalar",
    comicInfoKey: null,
  },

  // ── External ──────────────────────────────────────────────────────────────
  externalIDs: {
    label: "Source IDs",
    group: "External",
    renderAs: "externalIDs",
    comicInfoKey: null,
  },
  urls: {
    label: "URLs",
    group: "External",
    renderAs: "urls",
    comicInfoKey: "web",
  },
} as const
