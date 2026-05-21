import React, { ReactElement } from "react"
import { CanonicalRecord } from "./useReconciler"

/**
 * Props for the ReconcilerFooter component.
 */
interface ReconcilerFooterProps {
  /** Number of unresolved conflicts remaining */
  unresolvedCount: number
  /** The canonical record to save (if all resolved) */
  canonicalRecord: CanonicalRecord
  /** Callback when cancel is clicked */
  onCancel: () => void
  /** Callback when save is clicked */
  onSave: (record: CanonicalRecord) => void
}

/**
 * Footer section of the ReconcilerDrawer containing:
 * - Status indicator (all resolved / conflicts remaining)
 * - Cancel button
 * - Save button (disabled if conflicts remain)
 *
 * The save button is only enabled when all conflicts are resolved.
 *
 * @example
 * ```tsx
 * <ReconcilerFooter
 *   unresolvedCount={0}
 *   canonicalRecord={record}
 *   onCancel={() => setOpen(false)}
 *   onSave={(record) => {
 *     saveRecord(record)
 *     setOpen(false)
 *   }}
 * />
 * ```
 */
export function ReconcilerFooter({
  unresolvedCount,
  canonicalRecord,
  onCancel,
  onSave,
}: ReconcilerFooterProps): ReactElement {
  const allResolved = unresolvedCount === 0

  return (
    <div className="flex-none border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-900">
      {/* Status indicator */}
      <div className="text-sm">
        {allResolved ? (
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <i className="icon-[solar--check-circle-bold] w-4 h-4" />
            All conflicts resolved
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <i className="icon-[solar--danger-triangle-outline] w-4 h-4" />
            {unresolvedCount} field{unresolvedCount !== 1 ? "s" : ""} still need a value
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(canonicalRecord)}
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
  )
}

