/**
 * @fileoverview Metadata reconciliation drawer component.
 *
 * This component provides a full-screen drawer interface for reconciling metadata
 * from multiple sources. It displays conflicts, allows user selection of preferred
 * values, and generates a canonical metadata record.
 *
 * @module components/ComicDetail/Tabs/ReconcilerDrawer
 */

import { ReactElement, useMemo, useState } from "react";
import { Drawer } from "vaul";

// ── Type definitions ───────────────────────────────────────────────────────────

export type SourceKey =
  | "comicvine"
  | "metron"
  | "gcd"
  | "locg"
  | "comicInfo"
  | "inferredMetadata";

export interface RawSourcedMetadata {
  [key: string]: any;
}

export interface RawInferredMetadata {
  [key: string]: any;
}

export interface CanonicalRecord {
  [key: string]: any;
}

// ── Field configuration ────────────────────────────────────────────────────────

type FieldGroup = "Core" | "Publication" | "Story" | "Physical" | "Credits";

interface FieldConfig {
  label: string;
  group: FieldGroup;
  comicInfoKey?: string;
  renderAs?: "text" | "image" | "longtext";
}

const FIELD_GROUPS: FieldGroup[] = ["Core", "Publication", "Story", "Physical", "Credits"];

const FIELD_CONFIG: Record<string, FieldConfig> = {
  title: { label: "Title", group: "Core", comicInfoKey: "Title" },
  series: { label: "Series", group: "Core", comicInfoKey: "Series" },
  issueNumber: { label: "Issue Number", group: "Core", comicInfoKey: "Number" },
  coverImage: { label: "Cover Image", group: "Core", renderAs: "image" },
  summary: { label: "Summary", group: "Story", comicInfoKey: "Summary", renderAs: "longtext" },
  publisher: { label: "Publisher", group: "Publication", comicInfoKey: "Publisher" },
  publicationDate: { label: "Publication Date", group: "Publication", comicInfoKey: "Year" },
  pageCount: { label: "Page Count", group: "Physical", comicInfoKey: "PageCount" },
  writers: { label: "Writers", group: "Credits", comicInfoKey: "Writer" },
  artists: { label: "Artists", group: "Credits", comicInfoKey: "Penciller" },
};

export const SOURCE_LABELS: Record<SourceKey, string> = {
  comicvine: "ComicVine",
  metron: "Metron",
  gcd: "Grand Comics Database",
  locg: "League of Comic Geeks",
  comicInfo: "ComicInfo.xml",
  inferredMetadata: "Inferred Metadata",
};

// ── Hook types ─────────────────────────────────────────────────────────────────

interface ScalarFieldState {
  kind: "scalar";
  candidates: Array<{ source: SourceKey; value: string }>;
  selectedSource: SourceKey | null;
  userValue?: string;
}

interface ArrayFieldState {
  kind: "array";
  items: Array<{
    itemKey: string;
    displayValue: string;
    source: SourceKey;
    selected: boolean;
  }>;
}

interface CreditsFieldState {
  kind: "credits";
  items: Array<{
    itemKey: string;
    name: string;
    role: string;
    source: SourceKey;
    selected: boolean;
  }>;
}

type FieldState = ScalarFieldState | ArrayFieldState | CreditsFieldState;

interface ReconcilerState {
  [fieldKey: string]: FieldState;
}

interface UseReconcilerReturn {
  state: ReconcilerState;
  unresolvedCount: number;
  canonicalRecord: CanonicalRecord;
  selectScalar: (fieldKey: string, source: SourceKey) => void;
  toggleItem: (fieldKey: string, itemKey: string, selected: boolean) => void;
  setBaseSource: (source: SourceKey) => void;
  reset: () => void;
}

// ── Mock reconciler hook ───────────────────────────────────────────────────────

/**
 * Hook for managing metadata reconciliation state and operations.
 *
 * This hook handles the complex state management required for reconciling metadata
 * from multiple sources. It tracks which values have been selected, manages conflicts,
 * and generates the final canonical record.
 *
 * @param {RawSourcedMetadata} sourcedMetadata - Metadata from various external sources (ComicVine, Metron, etc.)
 * @param {RawInferredMetadata} [inferredMetadata] - Optional metadata inferred from the file itself
 * @returns {UseReconcilerReturn} Object containing reconciliation state and control functions
 *
 * @example
 * const { state, selectScalar, canonicalRecord } = useReconciler(sourcedData);
 *
 * // Select a value for a field
 * selectScalar('title', 'comicvine');
 *
 * // Get the final reconciled data
 * console.log(canonicalRecord);
 */
function useReconciler(
  sourcedMetadata: RawSourcedMetadata,
  inferredMetadata?: RawInferredMetadata
): UseReconcilerReturn {
  const [state, setState] = useState<ReconcilerState>(() => {
    // Initialize with mock data for demonstration
    const initialState: ReconcilerState = {};

    // Add some mock scalar fields
    Object.entries(FIELD_CONFIG).forEach(([fieldKey, config]) => {
      if (config.group === "Credits") {
        // Mock credits field
        initialState[fieldKey] = {
          kind: "credits",
          items: [
            {
              itemKey: `${fieldKey}-1`,
              name: "John Doe",
              role: config.label.slice(0, -1), // Remove 's' from "Writers" -> "Writer"
              source: "comicvine",
              selected: true,
            },
          ],
        };
      } else if (fieldKey === "coverImage") {
        // Mock image field
        initialState[fieldKey] = {
          kind: "scalar",
          candidates: [
            { source: "comicvine", value: "https://example.com/cover.jpg" },
          ],
          selectedSource: null,
        };
      } else {
        // Mock other scalar fields
        initialState[fieldKey] = {
          kind: "scalar",
          candidates: [
            { source: "comicvine", value: `${config.label} from ComicVine` },
            { source: "metron", value: `${config.label} from Metron` },
          ],
          selectedSource: null,
        };
      }
    });

    return initialState;
  });

  const unresolvedCount = useMemo(() => {
    return Object.values(state).filter((fs) => {
      if (fs.kind === "scalar") {
        return fs.candidates.length > 1 && fs.selectedSource === null && !fs.userValue;
      }
      return false;
    }).length;
  }, [state]);

  const canonicalRecord = useMemo(() => {
    const record: CanonicalRecord = {};
    Object.entries(state).forEach(([fieldKey, fs]) => {
      if (fs.kind === "scalar" && fs.selectedSource) {
        const candidate = fs.candidates.find((c) => c.source === fs.selectedSource);
        if (candidate) record[fieldKey] = candidate.value;
      } else if (fs.kind === "array") {
        record[fieldKey] = fs.items.filter((item) => item.selected).map((item) => item.displayValue);
      } else if (fs.kind === "credits") {
        record[fieldKey] = fs.items.filter((item) => item.selected).map((item) => ({
          name: item.name,
          role: item.role,
        }));
      }
    });
    return record;
  }, [state]);

  /**
   * Selects a specific source's value for a scalar field.
   *
   * When multiple sources provide different values for the same field, this function
   * allows the user to choose which source's value should be used in the final
   * canonical record.
   *
   * @param {string} fieldKey - The key of the field being selected (e.g., 'title', 'publisher')
   * @param {SourceKey} source - The source whose value should be selected
   */
  const selectScalar = (fieldKey: string, source: SourceKey) => {
    setState((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        selectedSource: source,
      } as ScalarFieldState,
    }));
  };

  /**
   * Toggles the selection state of an item in array or credits fields.
   *
   * This function is used for fields that can have multiple values selected,
   * such as tags, genres, or creator credits. It updates the selected state
   * of a specific item within the field.
   *
   * @param {string} fieldKey - The key of the field containing the item
   * @param {string} itemKey - The unique identifier of the item to toggle
   * @param {boolean} selected - Whether the item should be selected or deselected
   *
   * @example
   * // Toggle a writer credit
   * toggleItem('writers', 'writer-123', true);
   *
   * // Deselect a tag
   * toggleItem('tags', 'tag-456', false);
   */
  const toggleItem = (fieldKey: string, itemKey: string, selected: boolean) => {
    setState((prev) => {
      const field = prev[fieldKey];
      if (field.kind === "array") {
        return {
          ...prev,
          [fieldKey]: {
            ...field,
            items: field.items.map((item) =>
              item.itemKey === itemKey ? { ...item, selected } : item
            ),
          } as ArrayFieldState,
        };
      } else if (field.kind === "credits") {
        return {
          ...prev,
          [fieldKey]: {
            ...field,
            items: field.items.map((item) =>
              item.itemKey === itemKey ? { ...item, selected } : item
            ),
          } as CreditsFieldState,
        };
      }
      return prev;
    });
  };

  /**
   * Sets a base source for all scalar fields that have values from that source.
   *
   * This is a bulk operation that selects values from a specific source for all
   * scalar fields where that source has provided a value. Useful for quickly
   * accepting all values from a trusted source.
   *
   * @param {SourceKey} source - The source to use as the base for all applicable fields
   *
   * @example
   * // Use all values from ComicVine where available
   * setBaseSource('comicvine');
   */
  const setBaseSource = (source: SourceKey) => {
    setState((prev) => {
      const newState = { ...prev };
      Object.entries(newState).forEach(([fieldKey, fs]) => {
        if (fs.kind === "scalar") {
          const hasCandidate = fs.candidates.some((c) => c.source === source);
          if (hasCandidate) {
            (newState[fieldKey] as ScalarFieldState).selectedSource = source;
          }
        }
      });
      return newState;
    });
  };

  /**
   * Resets all field selections to their initial state.
   *
   * This function clears all selected values across all field types:
   * - For scalar fields: clears the selected source
   * - For array fields: deselects all items
   * - For credits fields: deselects all credits
   *
   * @returns {void}
   *
   * @example
   * // Reset all selections after user clicks "Reset" button
   * reset();
   */
  const reset = () => {
    setState((prev) => {
      const newState = { ...prev };
      Object.entries(newState).forEach(([fieldKey, fs]) => {
        if (fs.kind === "scalar") {
          (newState[fieldKey] as ScalarFieldState).selectedSource = null;
        } else if (fs.kind === "array") {
          newState[fieldKey] = {
            ...fs,
            items: fs.items.map((item) => ({ ...item, selected: false })),
          } as ArrayFieldState;
        } else if (fs.kind === "credits") {
          newState[fieldKey] = {
            ...fs,
            items: fs.items.map((item) => ({ ...item, selected: false })),
          } as CreditsFieldState;
        }
      });
      return newState;
    });
  };

  return {
    state,
    unresolvedCount,
    canonicalRecord,
    selectScalar,
    toggleItem,
    setBaseSource,
    reset,
  };
}

// ── Source styling ─────────────────────────────────────────────────────────────

/**
 * Tailwind CSS classes for source badges.
 * Maps each source to its distinctive color scheme.
 */
const SOURCE_BADGE: Record<SourceKey, string> = {
  comicvine: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  metron:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  gcd: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  locg: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  comicInfo:
    "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300",
  inferredMetadata:
    "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300",
};

/**
 * Tailwind CSS classes for selected state styling.
 * Maps each source to its ring/background color when selected.
 */
const SOURCE_SELECTED: Record<SourceKey, string> = {
  comicvine: "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20",
  metron: "ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20",
  gcd: "ring-2 ring-orange-400 bg-orange-50 dark:bg-orange-900/20",
  locg: "ring-2 ring-teal-400 bg-teal-50 dark:bg-teal-900/20",
  comicInfo: "ring-2 ring-slate-400 bg-slate-50 dark:bg-slate-700/40",
  inferredMetadata: "ring-2 ring-gray-400 bg-gray-50 dark:bg-gray-700/40",
};

/** Abbreviated source names for compact badge display. */
const SOURCE_SHORT: Record<SourceKey, string> = {
  comicvine: "CV",
  metron: "Metron",
  gcd: "GCD",
  locg: "LoCG",
  comicInfo: "XML",
  inferredMetadata: "Local",
};

/** Preferred display order for metadata sources. */
const SOURCE_ORDER: SourceKey[] = [
  "comicvine",
  "metron",
  "gcd",
  "locg",
  "comicInfo",
  "inferredMetadata",
];

/** Filter modes for displaying fields in the reconciliation view. */
type FilterMode = "all" | "conflicts" | "unresolved";

// ── Props ──────────────────────────────────────────────────────────────────────

/**
 * Props for the ReconcilerDrawer component.
 */
export interface ReconcilerDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when the drawer open state changes */
  onOpenChange: (open: boolean) => void;
  /** Metadata from various sources (ComicVine, Metron, etc.) */
  sourcedMetadata: RawSourcedMetadata;
  /** Optional metadata inferred from the file */
  inferredMetadata?: RawInferredMetadata;
  /** Callback when saving the reconciled canonical record */
  onSave: (record: CanonicalRecord) => void;
}

// ── Scalar cell ────────────────────────────────────────────────────────────────

/**
 * Props for the ScalarCell component.
 * @interface ScalarCellProps
 */
interface ScalarCellProps {
  /** The value to display in the cell */
  value: string | null;
  /** Whether this cell is currently selected */
  isSelected: boolean;
  /** Whether the value should be rendered as an image */
  isImage: boolean;
  /** Whether the value is long text that should be truncated */
  isLongtext: boolean;
  /** Click handler for selecting this cell */
  onClick: () => void;
}

/**
 * Renders a single metadata value cell for scalar fields.
 * Handles different display modes including text, images, and long text.
 *
 * @param {ScalarCellProps} props - The component props
 * @returns {ReactElement} The rendered cell
 */
function ScalarCell({
  value,
  isSelected,
  isImage,
  isLongtext,
  onClick,
}: ScalarCellProps): ReactElement {
  if (!value) {
    return (
      <span className="text-slate-300 dark:text-slate-600 text-sm px-2 pt-1.5 block">
        —
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-2 py-1.5 rounded-md border transition-all ${
        isSelected
          ? `border-transparent ${SOURCE_SELECTED[/* filled by parent */ "comicvine"]}`
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750"
      }`}
    >
      {isImage ? (
        <img
          src={value}
          alt="cover"
          className="w-full h-24 object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span
          className={`block text-slate-700 dark:text-slate-300 ${isLongtext ? "line-clamp-3 whitespace-normal" : "truncate"}`}
        >
          {value}
        </span>
      )}
      {isSelected && (
        <i className="icon-[solar--check-circle-bold] w-3.5 h-3.5 text-green-500 mt-0.5 block" />
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Metadata reconciliation drawer component.
 *
 * Provides a full-screen interface for reconciling metadata from multiple sources.
 * Users can view conflicts, select preferred values, and generate a canonical record.
 *
 * Features:
 * - Side-by-side comparison of metadata from different sources
 * - Conflict detection and resolution
 * - Filtering by all fields, conflicts only, or unresolved conflicts
 * - Bulk selection using "Use all" for a specific source
 * - Visual indicators for selected values and conflicts
 *
 * @param {ReconcilerDrawerProps} props - Component props
 * @returns {ReactElement} The rendered reconciliation drawer
 */
export function ReconcilerDrawer({
  open,
  onOpenChange,
  sourcedMetadata,
  inferredMetadata,
  onSave,
}: ReconcilerDrawerProps): ReactElement {
  const [filter, setFilter] = useState<FilterMode>("all");

  const {
    state,
    unresolvedCount,
    canonicalRecord,
    selectScalar,
    toggleItem,
    setBaseSource,
    reset,
  } = useReconciler(sourcedMetadata, inferredMetadata);

  // Derive which sources actually contributed data
  const activeSources = useMemo<SourceKey[]>(() => {
    const seen = new Set<SourceKey>();
    for (const fieldState of Object.values(state)) {
      if (fieldState.kind === "scalar") {
        for (const c of fieldState.candidates) seen.add(c.source);
      } else if (fieldState.kind === "array" || fieldState.kind === "credits") {
        for (const item of fieldState.items)
          seen.add((item as { source: SourceKey }).source);
      }
    }
    return SOURCE_ORDER.filter((s) => seen.has(s));
  }, [state]);

  // Grid: 180px label + one equal column per active source
  const gridCols = `180px repeat(${Math.max(activeSources.length, 1)}, minmax(0, 1fr))`;

  /**
   * Determines whether a field should be displayed based on the current filter mode.
   *
   * This function implements the filtering logic for the reconciliation view:
   * - "all": Shows all fields
   * - "conflicts": Shows only fields where multiple sources provide different values
   * - "unresolved": Shows only scalar fields with conflicts that haven't been resolved
   *
   * @param {string} fieldKey - The key of the field to check
   * @returns {boolean} True if the field should be shown, false otherwise
   *
   * @example
   * // Check if title field should be displayed
   * const showTitle = shouldShow('title');
   */
  function shouldShow(fieldKey: string): boolean {
    const fs = state[fieldKey];
    if (!fs) return false;
    if (filter === "all") return true;
    if (filter === "conflicts") {
      if (fs.kind === "scalar") return fs.candidates.length > 1;
      if (fs.kind === "array" || fs.kind === "credits") {
        const srcs = new Set(
          (fs.items as Array<{ source: SourceKey }>).map((i) => i.source),
        );
        return srcs.size > 1;
      }
      return false;
    }
    // unresolved
    return (
      fs.kind === "scalar" &&
      fs.candidates.length > 1 &&
      fs.selectedSource === null &&
      fs.userValue === undefined
    );
  }

  const allResolved = unresolvedCount === 0;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-theme-light-bg dark:bg-theme-dark-bg outline-none"
        >
          <Drawer.Title className="sr-only">
            Reconcile metadata sources
          </Drawer.Title>

          {/* ── Header ── */}
          <div className="flex-none border-b border-slate-200 dark:border-slate-700 shadow-sm">
            {/* Title + controls */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <i className="icon-[solar--refresh-circle-outline] w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                  Reconcile Metadata
                </span>
                {unresolvedCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {unresolvedCount} unresolved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Filter pill */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
                  {(["all", "conflicts", "unresolved"] as FilterMode[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        onClick={() => setFilter(mode)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                          filter === mode
                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={reset}
                  title="Reset all selections"
                  className="px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Reset
                </button>

                <button
                  onClick={() => onOpenChange(false)}
                  title="Close"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <i className="icon-[solar--close-square-outline] w-5 h-5 block" />
                </button>
              </div>
            </div>

            {/* Source column headers */}
            <div
              className="px-4 pb-3"
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: "8px",
              }}
            >
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-end pb-0.5">
                Field
              </div>
              {activeSources.map((src) => (
                <div key={src} className="flex flex-col gap-1.5">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${SOURCE_BADGE[src]}`}
                  >
                    {SOURCE_LABELS[src]}
                  </span>
                  <button
                    onClick={() => setBaseSource(src)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-left transition-colors"
                  >
                    Use all ↓
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            {FIELD_GROUPS.map((group) => {
              const fieldsInGroup = Object.entries(FIELD_CONFIG)
                .filter(([, cfg]) => cfg.group === group)
                .filter(([key]) => shouldShow(key));

              if (fieldsInGroup.length === 0) return null;

              return (
                <div key={group}>
                  {/* Group sticky header */}
                  <div className="sticky top-0 z-10 px-4 py-2 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {group}
                    </span>
                  </div>

                  {/* Field rows */}
                  {fieldsInGroup.map(([fieldKey, fieldCfg]) => {
                    const fs = state[fieldKey];
                    if (!fs) return null;

                    const isUnresolved =
                      fs.kind === "scalar" &&
                      fs.candidates.length > 1 &&
                      fs.selectedSource === null &&
                      fs.userValue === undefined;

                    return (
                      <div
                        key={fieldKey}
                        className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                          isUnresolved
                            ? "bg-amber-50/50 dark:bg-amber-950/20"
                            : ""
                        }`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: gridCols,
                          gap: "8px",
                          padding: "10px 16px",
                          alignItems: "start",
                        }}
                      >
                        {/* Label column */}
                        <div className="flex flex-col gap-0.5 pt-1.5 pr-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
                            {fieldCfg.label}
                          </span>
                          {fieldCfg.comicInfoKey && (
                            <span className="text-xs text-slate-400 font-mono leading-none">
                              {fieldCfg.comicInfoKey}
                            </span>
                          )}
                          {isUnresolved && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                              <i className="icon-[solar--danger-triangle-outline] w-3 h-3" />
                              conflict
                            </span>
                          )}
                        </div>

                        {/* Content — varies by kind */}
                        {fs.kind === "scalar" ? (
                          // One cell per active source
                          activeSources.map((src) => {
                            const candidate = fs.candidates.find(
                              (c) => c.source === src,
                            );
                            const isSelected = fs.selectedSource === src;

                            // For selected state we need the source-specific color
                            const selectedClass = isSelected
                              ? SOURCE_SELECTED[src]
                              : "";

                            if (!candidate) {
                              return (
                                <span
                                  key={src}
                                  className="text-slate-300 dark:text-slate-600 text-sm px-2 pt-1.5 block"
                                >
                                  —
                                </span>
                              );
                            }

                            return (
                              <button
                                key={src}
                                onClick={() => selectScalar(fieldKey, src)}
                                className={`w-full text-left text-sm px-2 py-1.5 rounded-md border transition-all ${
                                  isSelected
                                    ? `border-transparent ${selectedClass}`
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750"
                                }`}
                              >
                                {fieldCfg.renderAs === "image" ? (
                                  <img
                                    src={candidate.value}
                                    alt="cover"
                                    className="w-full h-24 object-contain rounded bg-slate-100 dark:bg-slate-900"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span
                                    className={`block text-slate-700 dark:text-slate-300 ${
                                      fieldCfg.renderAs === "longtext"
                                        ? "line-clamp-3 whitespace-normal text-xs leading-relaxed"
                                        : "truncate"
                                    }`}
                                  >
                                    {candidate.value}
                                  </span>
                                )}
                                {isSelected && (
                                  <i className="icon-[solar--check-circle-bold] w-3.5 h-3.5 text-green-500 mt-0.5 block" />
                                )}
                              </button>
                            );
                          })
                        ) : fs.kind === "array" ? (
                          // Merged list spanning all source columns
                          <div
                            className="flex flex-wrap gap-1.5"
                            style={{ gridColumn: "2 / -1" }}
                          >
                            {fs.items.length === 0 ? (
                              <span className="text-slate-400 dark:text-slate-500 text-sm">
                                No data
                              </span>
                            ) : (
                              fs.items.map((item) => (
                                <label
                                  key={item.itemKey}
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer transition-all text-sm select-none ${
                                    item.selected
                                      ? "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                      : "border-dashed border-slate-200 dark:border-slate-700 opacity-40"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={(e) =>
                                      toggleItem(
                                        fieldKey,
                                        item.itemKey,
                                        e.target.checked,
                                      )
                                    }
                                    className="w-3 h-3 rounded accent-slate-600 flex-none"
                                  />
                                  <span className="text-slate-700 dark:text-slate-300">
                                    {item.displayValue}
                                  </span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_BADGE[item.source]}`}
                                  >
                                    {SOURCE_SHORT[item.source]}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        ) : fs.kind === "credits" ? (
                          // Credits spanning all source columns
                          <div
                            className="flex flex-col gap-1"
                            style={{ gridColumn: "2 / -1" }}
                          >
                            {fs.items.length === 0 ? (
                              <span className="text-slate-400 dark:text-slate-500 text-sm">
                                No data
                              </span>
                            ) : (
                              fs.items.map((item) => (
                                <label
                                  key={item.itemKey}
                                  className={`inline-flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-pointer transition-all text-sm select-none ${
                                    item.selected
                                      ? "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                      : "border-dashed border-slate-200 dark:border-slate-700 opacity-40"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={(e) =>
                                      toggleItem(
                                        fieldKey,
                                        item.itemKey,
                                        e.target.checked,
                                      )
                                    }
                                    className="w-3 h-3 rounded accent-slate-600 flex-none"
                                  />
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {item.name}
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500">
                                    ·
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                                    {item.role}
                                  </span>
                                  <span
                                    className={`ml-auto text-xs px-1.5 py-0.5 rounded font-medium flex-none ${SOURCE_BADGE[item.source]}`}
                                  >
                                    {SOURCE_SHORT[item.source]}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        ) : (
                          // GTIN and other complex types
                          <div
                            className="pt-1.5"
                            style={{ gridColumn: "2 / -1" }}
                          >
                            <span className="text-slate-400 dark:text-slate-500 text-sm italic">
                              Structured field — editor coming soon
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Empty state when filter hides everything */}
            {FIELD_GROUPS.every((group) =>
              Object.entries(FIELD_CONFIG)
                .filter(([, cfg]) => cfg.group === group)
                .every(([key]) => !shouldShow(key)),
            ) && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500">
                <i className="icon-[solar--check-circle-bold] w-10 h-10 text-green-400" />
                <span className="text-sm">
                  {filter === "unresolved"
                    ? "No unresolved conflicts"
                    : "No fields match the current filter"}
                </span>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex-none border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between bg-theme-light-accent dark:bg-theme-dark-accent">
            <div className="text-sm">
              {allResolved ? (
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <i className="icon-[solar--check-circle-bold] w-4 h-4" />
                  All conflicts resolved
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <i className="icon-[solar--danger-triangle-outline] w-4 h-4" />
                  {unresolvedCount} field{unresolvedCount !== 1 ? "s" : ""}{" "}
                  still need a value
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave(canonicalRecord);
                  onOpenChange(false);
                }}
                disabled={!allResolved}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  allResolved
                    ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                Save Canonical Record
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
