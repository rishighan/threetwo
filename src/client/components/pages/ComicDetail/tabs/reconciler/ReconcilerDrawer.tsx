import React, { ReactElement, useMemo, useState } from "react"
import { Drawer } from "vaul"
import {
  useReconciler,
  SourceKey,
  RawSourcedMetadata,
  RawInferredMetadata,
  CanonicalRecord,
} from "./useReconciler"
import { SOURCE_ORDER, FilterMode } from "./reconciler.utils"
import { ReconcilerHeader } from "./ReconcilerHeader"
import { ReconcilerBody } from "./ReconcilerBody"
import { ReconcilerFooter } from "./ReconcilerFooter"

/**
 * Props for the ReconcilerDrawer component.
 */
export interface ReconcilerDrawerProps {
  /** Whether the drawer is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Metadata from external sources (ComicVine, Metron, etc.) */
  sourcedMetadata: RawSourcedMetadata
  /** Metadata inferred from the file itself */
  inferredMetadata?: RawInferredMetadata
  /** Callback when the canonical record is saved */
  onSave: (record: CanonicalRecord) => void
}

/**
 * A full-screen drawer for reconciling metadata from multiple sources.
 *
 * This component presents all available metadata sources side-by-side,
 * allowing users to:
 * - Select the preferred value for each field when conflicts exist
 * - Merge array values (genres, tags) from multiple sources
 * - Filter view to show all fields, only conflicts, or only unresolved
 * - Bulk-select all values from a single source
 *
 * The reconciler enforces that all conflicts must be resolved before
 * the canonical record can be saved.
 *
 * @example
 * ```tsx
 * <ReconcilerDrawer
 *   open={showReconciler}
 *   onOpenChange={setShowReconciler}
 *   sourcedMetadata={{
 *     comicvine: { title: "Spider-Man #1", ... },
 *     metron: { title: "Amazing Spider-Man #1", ... }
 *   }}
 *   inferredMetadata={{ series: "Spider-Man", ... }}
 *   onSave={(canonical) => {
 *     updateComicMetadata(canonical)
 *   }}
 * />
 * ```
 */
export function ReconcilerDrawer({
  open,
  onOpenChange,
  sourcedMetadata,
  inferredMetadata,
  onSave,
}: ReconcilerDrawerProps): ReactElement {
  const [filter, setFilter] = useState<FilterMode>("all")

  // Initialize reconciler hook with all metadata sources
  const { state, unresolvedCount, canonicalRecord, selectScalar, toggleItem, setBaseSource, reset } =
    useReconciler(sourcedMetadata, inferredMetadata)

  /**
   * Derive which sources actually contributed data.
   * Only sources with at least one field value are shown as columns.
   */
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

  /**
   * Grid layout: 180px label column + equal columns for each active source.
   */
  const gridCols = `180px repeat(${Math.max(activeSources.length, 1)}, minmax(0, 1fr))`

  /**
   * Handle save: pass canonical record to parent and close drawer.
   */
  const handleSave = (record: CanonicalRecord): void => {
    onSave(record)
    onOpenChange(false)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col bg-theme-light-bg dark:bg-theme-dark-bg outline-none"
        >
          <Drawer.Title className="sr-only">Reconcile metadata sources</Drawer.Title>

          <ReconcilerHeader
            unresolvedCount={unresolvedCount}
            filter={filter}
            onFilterChange={setFilter}
            onReset={reset}
            onClose={() => onOpenChange(false)}
            activeSources={activeSources}
            gridCols={gridCols}
            onSetBaseSource={setBaseSource}
          />

          <ReconcilerBody
            state={state}
            filter={filter}
            activeSources={activeSources}
            gridCols={gridCols}
            onSelectScalar={selectScalar}
            onToggleItem={toggleItem}
          />

          <ReconcilerFooter
            unresolvedCount={unresolvedCount}
            canonicalRecord={canonicalRecord}
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
