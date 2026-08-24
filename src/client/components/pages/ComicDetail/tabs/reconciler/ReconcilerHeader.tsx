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
  const filterModeIcons: Record<FilterMode, string> = {
    all: "icon-[solar--list-outline]",
    conflicts: "icon-[solar--danger-triangle-outline]",
    unresolved: "icon-[solar--danger-circle-outline]",
  }

  return (
    <div className="flex-none border-b border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Title + controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
            Reconcile Metadata
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pill */}
          <div className="inline-flex h-9 items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 gap-0.5">
            {filterModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onFilterChange(mode)}
                aria-pressed={filter === mode}
                className={`group inline-flex h-7 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 align-middle text-xs font-semibold capitalize transition-all duration-300 ease-in-out ${
                  filter === mode
                    ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-slate-100 shadow-sm"
                    : "bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <i className={`${filterModeIcons[mode]} w-3.5 h-3.5 block`} />
                {mode}
                {mode === "unresolved" && unresolvedCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.1rem] p-0.5 rounded-sm text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {unresolvedCount}
                  </span>
                )}
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
        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase flex items-end pb-0.5">

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
