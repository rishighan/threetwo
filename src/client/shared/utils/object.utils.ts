import { transform, isEqual, isObject } from "lodash";

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const difference = (object, base) => {
  return changes(object, base);
};

const changes = (object, base) => {
  return transform(object, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] =
        isObject(value) && isObject(base[key])
          ? changes(value, base[key])
          : value;
    }
  });
};


export type TraverseFunction<T> = (
  obj: T,
  prop: string,
  value: unknown,
  scope: string[],
) => void;

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object to traverse
 * @param  {Object} fn     Callback function
 * @return {Object}        Return a new object who represent the diff
 */
export const traverseObject = <T = Record<string, unknown>>(
  object: T,
  fn: TraverseFunction<T>,
): void => traverseInternal(object, fn, []);

const traverseInternal = <T = Record<string, unknown>>(
  object: T,
  fn: TraverseFunction<T>,
  scope: string[] = [],
): void => {
  Object.entries(object).forEach(([key, value]) => {
    fn.apply(this, [object, key, value, scope]);
    if (value !== null && typeof value === "object") {
      traverseInternal(value, fn, scope.concat(key));
    }
  });
};
