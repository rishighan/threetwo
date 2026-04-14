import React, { ReactElement, useMemo, useState } from "react"
import { Drawer } from "vaul"
import { FIELD_CONFIG, FIELD_GROUPS } from "./reconciler.fieldConfig"
import {
  useReconciler,
  SourceKey,
  SOURCE_LABELS,
  RawSourcedMetadata,
  RawInferredMetadata,
  CanonicalRecord,
} from "./useReconciler"

// ── Source styling ─────────────────────────────────────────────────────────────

const SOURCE_BADGE: Record<SourceKey, string> = {
  comicvine:        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  metron:           "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  gcd:              "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  locg:             "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  comicInfo:        "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300",
  inferredMetadata: "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300",
}

const SOURCE_SELECTED: Record<SourceKey, string> = {
  comicvine:        "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20",
  metron:           "ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20",
  gcd:              "ring-2 ring-orange-400 bg-orange-50 dark:bg-orange-900/20",
  locg:             "ring-2 ring-teal-400 bg-teal-50 dark:bg-teal-900/20",
  comicInfo:        "ring-2 ring-slate-400 bg-slate-50 dark:bg-slate-700/40",
  inferredMetadata: "ring-2 ring-gray-400 bg-gray-50 dark:bg-gray-700/40",
}

/** Abbreviated source names for compact badge display. */
const SOURCE_SHORT: Record<SourceKey, string> = {
  comicvine:        "CV",
  metron:           "Metron",
  gcd:              "GCD",
  locg:             "LoCG",
  comicInfo:        "XML",
  inferredMetadata: "Local",
}

const SOURCE_ORDER: SourceKey[] = [
  "comicvine", "metron", "gcd", "locg", "comicInfo", "inferredMetadata",
]

type FilterMode = "all" | "conflicts" | "unresolved"

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ReconcilerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourcedMetadata: RawSourcedMetadata
  inferredMetadata?: RawInferredMetadata
  onSave: (record: CanonicalRecord) => void
}

// ── Scalar cell ────────────────────────────────────────────────────────────────

interface ScalarCellProps {
  value: string | null
  isSelected: boolean
  isImage: boolean
  isLongtext: boolean
  onClick: () => void
}

function ScalarCell({ value, isSelected, isImage, isLongtext, onClick }: ScalarCellProps): ReactElement {
  if (!value) {
    return <span className="text-slate-300 dark:text-slate-600 text-sm px-2 pt-1.5 block">—</span>
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
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
      ) : (
        <span className={`block text-slate-700 dark:text-slate-300 ${isLongtext ? "line-clamp-3 whitespace-normal" : "truncate"}`}>
          {value}
        </span>
      )}
      {isSelected && (
        <i className="icon-[solar--check-circle-bold] w-3.5 h-3.5 text-green-500 mt-0.5 block" />
      )}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ReconcilerDrawer({
  open,
  onOpenChange,
  sourcedMetadata,
  inferredMetadata,
  onSave,
}: ReconcilerDrawerProps): ReactElement {
  const [filter, setFilter] = useState<FilterMode>("all")

  const {
    state,
    unresolvedCount,
    canonicalRecord,
    selectScalar,
    toggleItem,
    setBaseSource,
    reset,
  } = useReconciler(sourcedMetadata, inferredMetadata)

  // Derive which sources actually contributed data
  const activeSources = useMemo<SourceKey[]>(() => {
    const seen = new Set<SourceKey>()
    for (const fieldState of Object.values(state)) {
      if (fieldState.kind === "scalar") {
        for (const c of fieldState.candidates) seen.add(c.source)
      } else if (fieldState.kind === "array" || fieldState.kind === "credits") {
        for (const item of fieldState.items) seen.add((item as { source: SourceKey }).source)
      }
    }
    return SOURCE_ORDER.filter((s) => seen.has(s))
  }, [state])

  // Grid: 180px label + one equal column per active source
  const gridCols = `180px repeat(${Math.max(activeSources.length, 1)}, minmax(0, 1fr))`

  function shouldShow(fieldKey: string): boolean {
    const fs = state[fieldKey]
    if (!fs) return false
    if (filter === "all") return true
    if (filter === "conflicts") {
      if (fs.kind === "scalar") return fs.candidates.length > 1
      if (fs.kind === "array" || fs.kind === "credits") {
        const srcs = new Set((fs.items as Array<{ source: SourceKey }>).map((i) => i.source))
        return srcs.size > 1
      }
      return false
    }
    // unresolved
    return (
      fs.kind === "scalar" &&
      fs.candidates.length > 1 &&
      fs.selectedSource === null &&
      fs.userValue === undefined
    )
  }

  const allResolved = unresolvedCount === 0

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 outline-none"
        >
          <Drawer.Title className="sr-only">Reconcile metadata sources</Drawer.Title>

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
                  {(["all", "conflicts", "unresolved"] as FilterMode[]).map((mode) => (
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
                  ))}
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
              style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px" }}
            >
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-end pb-0.5">
                Field
              </div>
              {activeSources.map((src) => (
                <div key={src} className="flex flex-col gap-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${SOURCE_BADGE[src]}`}>
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
                .filter(([key]) => shouldShow(key))

              if (fieldsInGroup.length === 0) return null

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
                    const fs = state[fieldKey]
                    if (!fs) return null

                    const isUnresolved =
                      fs.kind === "scalar" &&
                      fs.candidates.length > 1 &&
                      fs.selectedSource === null &&
                      fs.userValue === undefined

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
                            const candidate = fs.candidates.find((c) => c.source === src)
                            const isSelected = fs.selectedSource === src

                            // For selected state we need the source-specific color
                            const selectedClass = isSelected ? SOURCE_SELECTED[src] : ""

                            if (!candidate) {
                              return (
                                <span
                                  key={src}
                                  className="text-slate-300 dark:text-slate-600 text-sm px-2 pt-1.5 block"
                                >
                                  —
                                </span>
                              )
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
                                    className="w-full h-24 object-cover rounded"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).style.display = "none"
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
                            )
                          })
                        ) : fs.kind === "array" ? (
                          // Merged list spanning all source columns
                          <div
                            className="flex flex-wrap gap-1.5"
                            style={{ gridColumn: "2 / -1" }}
                          >
                            {fs.items.length === 0 ? (
                              <span className="text-slate-400 dark:text-slate-500 text-sm">No data</span>
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
                                      toggleItem(fieldKey, item.itemKey, e.target.checked)
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
                              <span className="text-slate-400 dark:text-slate-500 text-sm">No data</span>
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
                                      toggleItem(fieldKey, item.itemKey, e.target.checked)
                                    }
                                    className="w-3 h-3 rounded accent-slate-600 flex-none"
                                  />
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {item.name}
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500">·</span>
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
                    )
                  })}
                </div>
              )
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
                  {filter === "unresolved" ? "No unresolved conflicts" : "No fields match the current filter"}
                </span>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex-none border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-900">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave(canonicalRecord)
                  onOpenChange(false)
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
  )
}
