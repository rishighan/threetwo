/**
 * @fileoverview Adapter Barrel Exports
 * 
 * Centralizes exports for all metadata source adapters.
 * Import adapters from this module for consistent usage.
 * 
 * @module components/ComicDetail/MatchPanel/adapters
 * 
 * @example
 * ```ts
 * import { 
 *   normalizeComicVineMatches, 
 *   normalizeGCDMatches, 
 *   normalizeMetronMatches 
 * } from "./adapters";
 * ```
 */

// ComicVine adapter
export { 
  normalizeComicVineMatch, 
  normalizeComicVineMatches,
  type RawComicVineMatch,
} from "./comicvineAdapter";

// GCD (Grand Comics Database) adapter
export { 
  normalizeGCDMatch, 
  normalizeGCDMatches,
} from "./gcdAdapter";

// Metron adapter
export { 
  normalizeMetronMatch, 
  normalizeMetronMatches,
} from "./metronAdapter";
