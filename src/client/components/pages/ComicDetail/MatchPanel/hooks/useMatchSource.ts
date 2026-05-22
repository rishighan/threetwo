/**
 * @fileoverview useMatchSource Hook
 * 
 * Provides source-specific configuration and display settings for metadata sources.
 * This hook returns static configuration data based on the source identifier,
 * used for consistent branding and messaging across the unified match panel.
 * 
 * @module components/ComicDetail/MatchPanel/hooks/useMatchSource
 */

import type { MetadataSource, SourceConfig } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Source Configurations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Static configuration for each metadata source.
 * Includes display names, icons, and default messages.
 */
const SOURCE_CONFIGS: Record<MetadataSource, SourceConfig> = {
  comicvine: {
    displayName: "ComicVine",
    shortName: "CV",
    iconClass: "icon-[simple-icons--gamespot]",
    emptyMessage: "ComicVine match results are an approximation. If you see no results or poor quality ones, you can override the search query parameters to get better matches.",
    accentColor: "text-red-500",
  },
  gcd: {
    displayName: "Grand Comics Database",
    shortName: "GCD",
    iconClass: "icon-[solar--database-bold-duotone]",
    emptyMessage: "GCD match results are an approximation based on series name, issue number, and year. The Grand Comics Database provides comprehensive metadata including detailed credits, story information, and publication details.",
    accentColor: "text-green-600",
  },
  metron: {
    displayName: "Metron",
    shortName: "Metron",
    iconClass: "icon-[solar--planet-bold-duotone]",
    emptyMessage: "Metron match results are an approximation. If you see no results or poor quality ones, you can override the search query parameters to get better matches.",
    accentColor: "text-blue-500",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook providing configuration for a specific metadata source.
 * 
 * Returns display settings and default messages used throughout the match panel UI.
 * This hook is pure and does not manage state - it simply provides config lookup.
 * 
 * @param source - Metadata source identifier
 * @returns Source configuration object
 * 
 * @example
 * ```tsx
 * const config = useMatchSource("gcd");
 * return (
 *   <div className={config.accentColor}>
 *     <i className={config.iconClass} />
 *     <span>{config.displayName}</span>
 *   </div>
 * );
 * ```
 */
export const useMatchSource = (source: MetadataSource): SourceConfig => {
  return SOURCE_CONFIGS[source];
};

/**
 * Get source configuration without hook (for non-component usage).
 * 
 * @param source - Metadata source identifier
 * @returns Source configuration object
 */
export const getSourceConfig = (source: MetadataSource): SourceConfig => {
  return SOURCE_CONFIGS[source];
};

export default useMatchSource;
