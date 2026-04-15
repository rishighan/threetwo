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
 * @note Comic types are now generated from GraphQL schema.
 * Import from '../../graphql/generated' instead of defining types here.
 * The generated types provide full type safety for GraphQL queries and mutations.
 * @see {@link module:graphql/generated}
 */
