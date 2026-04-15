/**
 * @fileoverview Utility functions for deep object comparison and traversal.
 * Provides tools for finding differences between objects and recursively
 * traversing nested object structures.
 * @module shared/utils/object
 */

import { transform, isEqual, isObject } from "lodash";

/**
 * Calculates the deep difference between two objects.
 * Returns a new object containing only the properties that differ between
 * the compared object and the base object.
 *
 * @param {Object} object - The object to compare
 * @param {Object} base - The base object to compare against
 * @returns {Object} A new object representing the differences, where each key
 *                   contains the value from `object` that differs from `base`
 * @example
 * const obj1 = { a: 1, b: { c: 2, d: 3 } };
 * const obj2 = { a: 1, b: { c: 2, d: 4 } };
 * difference(obj1, obj2); // returns { b: { d: 3 } }
 */
export const difference = (object: Record<string, unknown>, base: Record<string, unknown>): Record<string, unknown> => {
  return changes(object, base);
};

/**
 * Internal recursive function that computes changes between two objects.
 *
 * @private
 * @param {Object} object - The object to compare
 * @param {Object} base - The base object to compare against
 * @returns {Object} Object containing the differences
 */
const changes = (object: Record<string, unknown>, base: Record<string, unknown>): Record<string, unknown> => {
  return transform(object, (result: Record<string, unknown>, value: unknown, key: string) => {
    if (!isEqual(value, base[key])) {
      (result as Record<string, unknown>)[key] =
        isObject(value) && isObject(base[key])
          ? changes(value as Record<string, unknown>, base[key] as Record<string, unknown>)
          : value;
    }
  });
};

/**
 * Callback function type for object traversal.
 * Called for each property encountered during traversal.
 *
 * @template T - The type of the object being traversed
 * @callback TraverseFunction
 * @param {T} obj - The root object being traversed
 * @param {string} prop - The current property name
 * @param {unknown} value - The value of the current property
 * @param {string[]} scope - Array of property names representing the path to current property
 */
export type TraverseFunction<T> = (
  obj: T,
  prop: string,
  value: unknown,
  scope: string[],
) => void;

/**
 * Recursively traverses all properties of an object, invoking a callback
 * for each property encountered. Useful for deep inspection or transformation
 * of nested object structures.
 *
 * @template T - The type of the object being traversed
 * @param {T} object - The object to traverse
 * @param {TraverseFunction<T>} fn - Callback function invoked for each property
 * @returns {void}
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 * traverseObject(obj, (obj, prop, value, scope) => {
 *   console.log(`${scope.join('.')}.${prop} = ${value}`);
 * });
 * // Logs:
 * // ".a = 1"
 * // ".b = [object Object]"
 * // "b.c = 2"
 */
export const traverseObject = <T extends Record<string, unknown> = Record<string, unknown>>(
  object: T,
  fn: TraverseFunction<T>,
): void => traverseInternal(object, fn, []);

/**
 * Internal recursive implementation for object traversal.
 *
 * @private
 * @template T - The type of the object being traversed
 * @param {T} object - The object to traverse
 * @param {TraverseFunction<T>} fn - Callback function invoked for each property
 * @param {string[]} [scope=[]] - Current path scope in the object hierarchy
 * @returns {void}
 */
const traverseInternal = <T extends Record<string, unknown>>(
  object: T,
  fn: TraverseFunction<T>,
  scope: string[] = [],
): void => {
  Object.entries(object as Record<string, unknown>).forEach(([key, value]) => {
    fn.apply(undefined, [object, key, value, scope]);
    if (value !== null && typeof value === "object") {
      traverseInternal(value as T, fn, scope.concat(key));
    }
  });
};
