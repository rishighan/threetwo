import React, { ReactElement } from "react"
import { SourceKey, ReconcilerState } from "./useReconciler"
import { FIELD_CONFIG, FIELD_GROUPS } from "./reconciler.fieldConfig"
import { FilterMode } from "./reconciler.utils"
import {
  ScalarFieldRow,
  ArrayFieldRow,
  CreditsFieldRow,
  UnsupportedFieldRow,
} from "./ReconcilerFieldRows"

/**
 * Props for the ReconcilerBody component.
 */
interface ReconcilerBodyProps {
  /** Current reconciler state for all fields */
  state: ReconcilerState
  /** Active filter mode */
  filter: FilterMode
  /** Active sources that have contributed data */
  activeSources: SourceKey[]
  /** Grid column template for layout */
  gridCols: string
  /** Callback when a scalar value is selected */
  onSelectScalar: (fieldKey: string, source: SourceKey) => void
  /** Callback when an array/credit item is toggled */
  onToggleItem: (fieldKey: string, itemKey: string, selected: boolean) => void
}

/**
 * Determines whether a field should be displayed based on the current filter.
 *
 * @param fieldState - The state of the field
 * @param filter - Current filter mode
 * @returns True if the field should be shown
 */
function shouldShowField(
  fieldState: ReconcilerState[string],
  filter: FilterMode,
): boolean {
  if (filter === "all") return true

  if (filter === "conflicts") {
    if (fieldState.kind === "scalar") {
      return fieldState.candidates.length > 1
    }
    if (fieldState.kind === "array" || fieldState.kind === "credits") {
      const sources = new Set(fieldState.items.map((i) => i.source))
      return sources.size > 1
    }
    return false
  }

  // unresolved: only scalar fields with conflicts and no selection
  return (
    fieldState.kind === "scalar" &&
    fieldState.candidates.length > 1 &&
    fieldState.selectedSource === null &&
    fieldState.userValue === undefined
  )
}

/**
 * Checks if a scalar field is unresolved (has conflict but no selection).
 *
 * @param fieldState - The state of the field
 * @returns True if unresolved
 */
function isFieldUnresolved(fieldState: ReconcilerState[string]): boolean {
  return (
    fieldState.kind === "scalar" &&
    fieldState.candidates.length > 1 &&
    fieldState.selectedSource === null &&
    fieldState.userValue === undefined
  )
}

/**
 * Scrollable body section of the ReconcilerDrawer.
 * Renders field groups with their respective field rows based on type.
 * Handles filtering and empty states.
 *
 * @example
 * ```tsx
 * <ReconcilerBody
 *   state={reconcilerState}
 *   filter="conflicts"
 *   activeSources={["comicvine", "metron"]}
 *   gridCols="180px repeat(2, minmax(0, 1fr))"
 *   onSelectScalar={selectScalar}
 *   onToggleItem={toggleItem}
 * />
 * ```
 */
export function ReconcilerBody({
  state,
  filter,
  activeSources,
  gridCols,
  onSelectScalar,
  onToggleItem,
}: ReconcilerBodyProps): ReactElement {
  // Check if all fields are filtered out
  const hasVisibleFields = FIELD_GROUPS.some((group) =>
    Object.entries(FIELD_CONFIG)
      .filter(([, cfg]) => cfg.group === group)
      .some(([key]) => {
        const fieldState = state[key]
        return fieldState && shouldShowField(fieldState, filter)
      }),
  )

  if (!hasVisibleFields) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500">
          <i className="icon-[solar--check-circle-bold] w-10 h-10 text-green-400" />
          <span className="text-sm">
            {filter === "unresolved"
              ? "No unresolved conflicts"
              : "No fields match the current filter"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {FIELD_GROUPS.map((group) => {
        const fieldsInGroup = Object.entries(FIELD_CONFIG)
          .filter(([, cfg]) => cfg.group === group)
          .filter(([key]) => {
            const fieldState = state[key]
            return fieldState && shouldShowField(fieldState, filter)
          })

        if (fieldsInGroup.length === 0) return null

        return (
          <div key={group}>
            {/* Group sticky header */}
            <div className="sticky top-0 z-10 px-4 py-2 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
              <span className="text-md font-bold text-slate-400 dark:text-slate-500">
                {group}
              </span>
            </div>

            {/* Field rows */}
            {fieldsInGroup.map(([fieldKey, fieldCfg]) => {
              const fieldState = state[fieldKey]
              if (!fieldState) return null

              const isUnresolved = isFieldUnresolved(fieldState)

              return (
                <div
                  key={fieldKey}
                  className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                    isUnresolved ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                  }`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    gap: "8px",
                    padding: "10px 16px",
                    alignItems: "start",
                  }}
                >
                  {fieldState.kind === "scalar" ? (
                    <ScalarFieldRow
                      fieldKey={fieldKey}
                      fieldConfig={fieldCfg}
                      candidates={fieldState.candidates}
                      selectedSource={fieldState.selectedSource}
                      activeSources={activeSources}
                      isUnresolved={isUnresolved}
                      onSelect={onSelectScalar}
                    />
                  ) : fieldState.kind === "array" ? (
                    <ArrayFieldRow
                      fieldKey={fieldKey}
                      fieldConfig={fieldCfg}
                      items={fieldState.items}
                      onToggle={onToggleItem}
                    />
                  ) : fieldState.kind === "credits" ? (
                    <CreditsFieldRow
                      fieldKey={fieldKey}
                      fieldConfig={fieldCfg}
                      items={fieldState.items}
                      onToggle={onToggleItem}
                    />
                  ) : (
                    <UnsupportedFieldRow fieldConfig={fieldCfg} />
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
