import React, { ReactElement } from "react"
import { SourceKey } from "./useReconciler"
import type { FieldConfig } from "./reconciler.fieldConfig"
import {
  getFieldCellClasses,
  getItemClasses,
  getCreditItemClasses,
  EmptyCell,
  CheckIcon,
  ConflictWarning,
  SOURCE_BADGE,
  SOURCE_SHORT,
} from "./reconciler.utils"

// ── Scalar Field Types ─────────────────────────────────────────────────────────

/**
 * Represents a candidate value from a specific source for a scalar field.
 */
interface ScalarCandidate {
  readonly source: SourceKey
  readonly value: string
}

/**
 * Props for ScalarFieldCell component.
 */
interface ScalarFieldCellProps {
  /** The candidate value to display */
  candidate: ScalarCandidate
  /** Whether this cell is selected */
  isSelected: boolean
  /** Field configuration for rendering hints */
  fieldConfig: FieldConfig
  /** Callback when clicked */
  onClick: () => void
}

/**
 * Displays a single cell for a scalar field value from one source.
 * Supports text, image, and longtext rendering modes.
 *
 * @example
 * ```tsx
 * <ScalarFieldCell
 *   candidate={{ source: "comicvine", value: "Amazing Spider-Man" }}
 *   isSelected={true}
 *   fieldConfig={FIELD_CONFIG.title}
 *   onClick={() => selectScalar("title", "comicvine")}
 * />
 * ```
 */
function ScalarFieldCell({
  candidate,
  isSelected,
  fieldConfig,
  onClick,
}: ScalarFieldCellProps): ReactElement {
  const isImage = fieldConfig.renderAs === "image"
  const isLongtext = fieldConfig.renderAs === "longtext"

  return (
    <button onClick={onClick} className={getFieldCellClasses(isSelected, candidate.source)}>
      {isImage ? (
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
            isLongtext ? "line-clamp-3 whitespace-normal text-xs leading-relaxed" : "truncate"
          }`}
        >
          {candidate.value}
        </span>
      )}
      {isSelected && <CheckIcon />}
    </button>
  )
}

/**
 * Props for ScalarFieldRow component.
 */
interface ScalarFieldRowProps {
  /** Unique field key */
  fieldKey: string
  /** Field configuration */
  fieldConfig: FieldConfig
  /** List of candidate values from different sources */
  candidates: readonly ScalarCandidate[]
  /** Currently selected source (if any) */
  selectedSource: SourceKey | null
  /** Active sources in the reconciler */
  activeSources: SourceKey[]
  /** Whether this field has unresolved conflicts */
  isUnresolved: boolean
  /** Callback when a candidate is selected */
  onSelect: (fieldKey: string, source: SourceKey) => void
}

/**
 * Renders a row for a scalar field, displaying one cell per active source.
 * Highlights unresolved conflicts and shows the selected value.
 *
 * @example
 * ```tsx
 * <ScalarFieldRow
 *   fieldKey="title"
 *   fieldConfig={FIELD_CONFIG.title}
 *   candidates={[
 *     { source: "comicvine", value: "Spider-Man #1" },
 *     { source: "metron", value: "Amazing Spider-Man #1" }
 *   ]}
 *   selectedSource="comicvine"
 *   activeSources={["comicvine", "metron"]}
 *   isUnresolved={false}
 *   onSelect={selectScalar}
 * />
 * ```
 */
export function ScalarFieldRow({
  fieldKey,
  fieldConfig,
  candidates,
  selectedSource,
  activeSources,
  isUnresolved,
  onSelect,
}: ScalarFieldRowProps): ReactElement {
  return (
    <>
      {/* Label column */}
      <div className="flex flex-col gap-0.5 pt-1.5 pr-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
          {fieldConfig.label}
        </span>
        {fieldConfig.comicInfoKey && (
          <span className="text-xs text-slate-400 font-mono leading-none">
            {fieldConfig.comicInfoKey}
          </span>
        )}
        {isUnresolved && <ConflictWarning />}
      </div>

      {/* Value cells - one per active source */}
      {activeSources.map((src) => {
        const candidate = candidates.find((c) => c.source === src)
        const isSelected = selectedSource === src

        if (!candidate) {
          return <EmptyCell key={src} />
        }

        return (
          <ScalarFieldCell
            key={src}
            candidate={candidate}
            isSelected={isSelected}
            fieldConfig={fieldConfig}
            onClick={() => onSelect(fieldKey, src)}
          />
        )
      })}
    </>
  )
}

// ── Array Field Types ──────────────────────────────────────────────────────────

/**
 * Represents an array item (e.g., genre, tag) from a source.
 */
interface ArrayItem {
  itemKey: string
  displayValue: string
  source: SourceKey
  selected: boolean
}

/**
 * Props for ArrayFieldRow component.
 */
interface ArrayFieldRowProps {
  /** Unique field key */
  fieldKey: string
  /** Field configuration */
  fieldConfig: FieldConfig
  /** Array items from all sources */
  items: ArrayItem[]
  /** Callback when an item is toggled */
  onToggle: (fieldKey: string, itemKey: string, selected: boolean) => void
}

/**
 * Renders a row for an array field (genres, tags, etc.).
 * Displays checkboxes for each unique value merged from all sources.
 *
 * @example
 * ```tsx
 * <ArrayFieldRow
 *   fieldKey="genres"
 *   fieldConfig={FIELD_CONFIG.genres}
 *   items={[
 *     { itemKey: "action-cv", displayValue: "Action", source: "comicvine", selected: true },
 *     { itemKey: "adventure-metron", displayValue: "Adventure", source: "metron", selected: false }
 *   ]}
 *   onToggle={toggleItem}
 * />
 * ```
 */
export function ArrayFieldRow({
  fieldKey,
  fieldConfig,
  items,
  onToggle,
}: ArrayFieldRowProps): ReactElement {
  return (
    <>
      {/* Label column */}
      <div className="flex flex-col gap-0.5 pt-1.5 pr-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
          {fieldConfig.label}
        </span>
        {fieldConfig.comicInfoKey && (
          <span className="text-xs text-slate-400 font-mono leading-none">
            {fieldConfig.comicInfoKey}
          </span>
        )}
      </div>

      {/* Items spanning all source columns */}
      <div className="flex flex-wrap gap-1.5" style={{ gridColumn: "2 / -1" }}>
        {items.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 text-sm">No data</span>
        ) : (
          items.map((item) => (
            <label key={item.itemKey} className={getItemClasses(item.selected)}>
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => onToggle(fieldKey, item.itemKey, e.target.checked)}
                className="w-3 h-3 rounded accent-slate-600 flex-none"
              />
              <span className="text-slate-700 dark:text-slate-300">{item.displayValue}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SOURCE_BADGE[item.source]}`}>
                {SOURCE_SHORT[item.source]}
              </span>
            </label>
          ))
        )}
      </div>
    </>
  )
}

// ── Credits Field Types ────────────────────────────────────────────────────────

/**
 * Represents a credit (creator) entry from a source.
 */
interface CreditItem {
  itemKey: string
  name: string
  role: string
  source: SourceKey
  selected: boolean
}

/**
 * Props for CreditsFieldRow component.
 */
interface CreditsFieldRowProps {
  /** Unique field key */
  fieldKey: string
  /** Field configuration */
  fieldConfig: FieldConfig
  /** Credit items from all sources */
  items: CreditItem[]
  /** Callback when a credit is toggled */
  onToggle: (fieldKey: string, itemKey: string, selected: boolean) => void
}

/**
 * Renders a row for credits field (writers, artists, etc.).
 * Displays checkboxes with name and role for each credit.
 *
 * @example
 * ```tsx
 * <CreditsFieldRow
 *   fieldKey="credits"
 *   fieldConfig={FIELD_CONFIG.credits}
 *   items={[
 *     { itemKey: "stan-lee", name: "Stan Lee", role: "Writer", source: "comicvine", selected: true }
 *   ]}
 *   onToggle={toggleItem}
 * />
 * ```
 */
export function CreditsFieldRow({
  fieldKey,
  fieldConfig,
  items,
  onToggle,
}: CreditsFieldRowProps): ReactElement {
  return (
    <>
      {/* Label column */}
      <div className="flex flex-col gap-0.5 pt-1.5 pr-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
          {fieldConfig.label}
        </span>
        {fieldConfig.comicInfoKey && (
          <span className="text-xs text-slate-400 font-mono leading-none">
            {fieldConfig.comicInfoKey}
          </span>
        )}
      </div>

      {/* Credit items spanning all source columns */}
      <div className="flex flex-col gap-1" style={{ gridColumn: "2 / -1" }}>
        {items.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 text-sm">No data</span>
        ) : (
          items.map((item) => (
            <label key={item.itemKey} className={getCreditItemClasses(item.selected)}>
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => onToggle(fieldKey, item.itemKey, e.target.checked)}
                className="w-3 h-3 rounded accent-slate-600 flex-none"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.name}
              </span>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">{item.role}</span>
              <span
                className={`ml-auto text-xs px-1.5 py-0.5 rounded font-medium flex-none ${SOURCE_BADGE[item.source]}`}
              >
                {SOURCE_SHORT[item.source]}
              </span>
            </label>
          ))
        )}
      </div>
    </>
  )
}

// ── Placeholder for unsupported field types ────────────────────────────────────

/**
 * Props for UnsupportedFieldRow component.
 */
interface UnsupportedFieldRowProps {
  /** Field configuration */
  fieldConfig: FieldConfig
}

/**
 * Placeholder row for field types that don't yet have editors.
 * Currently used for GTIN and other complex structured types.
 */
export function UnsupportedFieldRow({ fieldConfig }: UnsupportedFieldRowProps): ReactElement {
  return (
    <>
      {/* Label column */}
      <div className="flex flex-col gap-0.5 pt-1.5 pr-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
          {fieldConfig.label}
        </span>
        {fieldConfig.comicInfoKey && (
          <span className="text-xs text-slate-400 font-mono leading-none">
            {fieldConfig.comicInfoKey}
          </span>
        )}
      </div>

      {/* Placeholder message */}
      <div className="pt-1.5" style={{ gridColumn: "2 / -1" }}>
        <span className="text-slate-400 dark:text-slate-500 text-sm italic">
          Structured field — editor coming soon
        </span>
      </div>
    </>
  )
}

