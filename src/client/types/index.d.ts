/**
 * @fileoverview TypeScript type declarations for module imports.
 * Provides type definitions for importing static assets and stylesheets
 * that aren't natively supported by TypeScript.
 * @module types
 */

/**
 * Module declaration for PNG image imports.
 * Allows importing .png files as string URLs.
 * @example
 * import logo from './assets/logo.png';
 * // logo is typed as string
 */
declare module "*.png" {
  const value: string;
  export = value;
}

/**
 * Module declaration for JPG image imports.
 * Allows importing .jpg files.
 */
declare module "*.jpg";

/**
 * Module declaration for GIF image imports.
 * Allows importing .gif files.
 */
declare module "*.gif";

/**
 * Module declaration for LESS stylesheet imports.
 * Allows importing .less files.
 */
declare module "*.less";

/**
 * Module declaration for SCSS stylesheet imports.
 * Allows importing .scss files.
 */
declare module "*.scss";

/**
 * Module declaration for CSS stylesheet imports.
 * Allows importing .css files.
 */
declare module "*.css";

/**
 * Module declaration for html-to-text library.
 * Provides the convert function for converting HTML to plain text.
 */
declare module "html-to-text" {
  export function convert(html: string, options?: {
    baseElements?: {
      selectors?: string[];
    };
    [key: string]: unknown;
  }): string;
}

/**
 * Module declaration for react-table library.
 */
declare module "react-table" {
  export function useTable(options: any, ...plugins: any[]): any;
  export function usePagination(hooks: any): void;
}

/**
 * Module declaration for react-masonry-css library.
 */
declare module "react-masonry-css" {
  import { ComponentType } from "react";
  const Masonry: ComponentType<any>;
  export default Masonry;
}

/**
 * RootState type for Redux/Zustand stores
 * Used across components for state typing
 */
declare global {
  type RootState = {
    fileOps: {
      recentComics: { docs: any[]; totalDocs: number };
      libraryServiceStatus: any;
    };
    comicInfo: {
      comicBooksDetails: any;
    };
    [key: string]: any;
  };
}

/**
 * @note Comic types are now generated from GraphQL schema.
 * Import from '../../graphql/generated' instead of defining types here.
 * The generated types provide full type safety for GraphQL queries and mutations.
 * @see {@link module:graphql/generated}
 */
