import React, { ReactElement } from "react"
import { SourceKey } from "./useReconciler"
import {
  FilterMode,
  SourceBadge,
  ConflictBadge,
} from "./reconciler.utils"

/**
 * Props for the ReconcilerHeader component.
 */
interface ReconcilerHeaderProps {
  /** Number of unresolved conflicts */
  unresolvedCount: number
  /** Current filter mode */
  filter: FilterMode
  /** Callback when filter changes */
  onFilterChange: (mode: FilterMode) => void
  /** Callback when reset is clicked */
  onReset: () => void
  /** Callback when close is clicked */
  onClose: () => void
  /** Active sources that have contributed data */
  activeSources: SourceKey[]
  /** Grid column template for layout */
  gridCols: string
  /** Callback when "Use all" is clicked for a source */
  onSetBaseSource: (source: SourceKey) => void
}

/**
 * Header section of the ReconcilerDrawer containing:
 * - Title and unresolved conflict badge
 * - Filter controls (all/conflicts/unresolved)
 * - Reset and close buttons
 * - Source column headers with "Use all" actions
 *
 * @example
 * ```tsx
 * <ReconcilerHeader
 *   unresolvedCount={3}
 *   filter="conflicts"
 *   onFilterChange={setFilter}
 *   onReset={reset}
 *   onClose={() => setOpen(false)}
 *   activeSources={["comicvine", "metron"]}
 *   gridCols="180px repeat(2, minmax(0, 1fr))"
 *   onSetBaseSource={setBaseSource}
 * />
 * ```
 */
export function ReconcilerHeader({
  unresolvedCount,
  filter,
  onFilterChange,
  onReset,
  onClose,
  activeSources,
  gridCols,
  onSetBaseSource,
}: ReconcilerHeaderProps): ReactElement {
  const filterModes: FilterMode[] = ["all", "conflicts", "unresolved"]

  return (
    <div className="flex-none border-b border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Title + controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <i className="icon-[solar--refresh-circle-outline] w-5 h-5 text-slate-500 dark:text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">
            Reconcile Metadata
          </span>
          {unresolvedCount > 0 && <ConflictBadge count={unresolvedCount} />}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
            {filterModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onFilterChange(mode)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  filter === mode
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onReset}
            title="Reset all selections"
            className="px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Reset
          </button>

          <button
            onClick={onClose}
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
        style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px" }}
      >
        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-end pb-0.5">
          Field
        </div>
        {activeSources.map((src) => (
          <div key={src} className="flex flex-col gap-1.5">
            <SourceBadge source={src} />
            <button
              onClick={() => onSetBaseSource(src)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-left transition-colors"
            >
              Use all ↓
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

