import React, { ReactElement } from "react"
import { SourceKey, SOURCE_LABELS } from "./useReconciler"

/**
 * Tailwind classes for source badge styling.
 * Each source has distinct colors for visual identification.
 */
export const SOURCE_BADGE: Record<SourceKey, string> = {
  comicvine: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  metron: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  gcd: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  locg: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  comicInfo: "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300",
  inferredMetadata: "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300",
}

/**
 * Tailwind classes for selected state styling.
 * Applied when a user selects a value from a specific source.
 */
export const SOURCE_SELECTED: Record<SourceKey, string> = {
  comicvine: "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20",
  metron: "ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20",
  gcd: "ring-2 ring-orange-400 bg-orange-50 dark:bg-orange-900/20",
  locg: "ring-2 ring-teal-400 bg-teal-50 dark:bg-teal-900/20",
  comicInfo: "ring-2 ring-slate-400 bg-slate-50 dark:bg-slate-700/40",
  inferredMetadata: "ring-2 ring-gray-400 bg-gray-50 dark:bg-gray-700/40",
}

/**
 * Abbreviated source names for compact badge display.
 */
export const SOURCE_SHORT: Record<SourceKey, string> = {
  comicvine: "CV",
  metron: "Metron",
  gcd: "GCD",
  locg: "LoCG",
  comicInfo: "XML",
  inferredMetadata: "Local",
}

/**
 * Canonical ordering for source columns in the reconciler UI.
 */
export const SOURCE_ORDER: SourceKey[] = [
  "comicvine",
  "metron",
  "gcd",
  "locg",
  "comicInfo",
  "inferredMetadata",
]

/**
 * Filter modes for the reconciler view.
 */
export type FilterMode = "all" | "conflicts" | "unresolved"

// ── Utility Functions ──────────────────────────────────────────────────────────

/**
 * Generates Tailwind classes for a field cell based on selection state.
 *
 * @param isSelected - Whether this cell's value is currently selected
 * @param source - The source key for source-specific styling
 * @returns Combined className string
 */
export function getFieldCellClasses(isSelected: boolean, source: SourceKey): string {
  const baseClasses =
    "w-full text-left text-sm px-2 py-1.5 rounded-md border transition-all"

  if (isSelected) {
    return `${baseClasses} border-transparent ${SOURCE_SELECTED[source]}`
  }

  return `${baseClasses} border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750`
}

/**
 * Generates Tailwind classes for array/credit item checkboxes.
 *
 * @param selected - Whether the item is selected
 * @returns Combined className string
 */
export function getItemClasses(selected: boolean): string {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer transition-all text-sm select-none"

  if (selected) {
    return `${baseClasses} border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800`
  }

  return `${baseClasses} border-dashed border-slate-200 dark:border-slate-700 opacity-40`
}

/**
 * Generates Tailwind classes for credit item rows.
 *
 * @param selected - Whether the credit is selected
 * @returns Combined className string
 */
export function getCreditItemClasses(selected: boolean): string {
  const baseClasses =
    "inline-flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-pointer transition-all text-sm select-none"

  if (selected) {
    return `${baseClasses} border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800`
  }

  return `${baseClasses} border-dashed border-slate-200 dark:border-slate-700 opacity-40`
}

// ── Reusable Components ────────────────────────────────────────────────────────

/**
 * Props for the SourceBadge component.
 */
interface SourceBadgeProps {
  /** The source key to display */
  source: SourceKey
  /** Whether to show abbreviated name (default: false) */
  short?: boolean
}

/**
 * Displays a colored badge for a metadata source.
 *
 * @example
 * ```tsx
 * <SourceBadge source="comicvine" />
 * <SourceBadge source="metron" short />
 * ```
 */
export function SourceBadge({ source, short = false }: SourceBadgeProps): ReactElement {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${SOURCE_BADGE[source]}`}>
      {short ? SOURCE_SHORT[source] : SOURCE_LABELS[source]}
    </span>
  )
}

/**
 * Displays a placeholder for empty/missing field values.
 */
export function EmptyCell(): ReactElement {
  return (
    <span className="text-slate-300 dark:text-slate-600 text-sm px-2 pt-1.5 block">—</span>
  )
}

/**
 * Props for the CheckIcon component.
 */
interface CheckIconProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Displays a checkmark icon indicating selection.
 */
export function CheckIcon({ className = "" }: CheckIconProps): ReactElement {
  return (
    <i
      className={`icon-[solar--check-circle-bold] w-3.5 h-3.5 text-green-500 mt-0.5 block ${className}`}
    />
  )
}

/**
 * Props for the ConflictBadge component.
 */
interface ConflictBadgeProps {
  /** Number of unresolved conflicts */
  count: number
}

/**
 * Displays a badge showing the number of unresolved conflicts.
 */
export function ConflictBadge({ count }: ConflictBadgeProps): ReactElement {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
      {count} unresolved
    </span>
  )
}

/**
 * Displays a warning icon with "conflict" label for unresolved fields.
 */
export function ConflictWarning(): ReactElement {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400 mt-0.5">
      <i className="icon-[solar--danger-triangle-outline] w-3 h-3" />
      conflict
    </span>
  )
}

