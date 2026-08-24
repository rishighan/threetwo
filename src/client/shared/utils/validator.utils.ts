/**
 * @fileoverview Validation utility functions for form inputs and data.
 * Provides validators for hostnames, URLs, and other common input types.
 * @module shared/utils/validator
 */

import { isNil, isUndefined } from "lodash";

/**
 * Validates a hostname string against RFC 1123 standards.
 * Hostnames must start and end with alphanumeric characters and can contain
 * hyphens. Each label (segment between dots) can be 1-63 characters.
 *
 * @param {string} hostname - The hostname string to validate
 * @returns {string|undefined} undefined if valid, error message string if invalid
 * @see {@link https://stackoverflow.com/a/3824105/656708 Hostname validation regex}
 * @example
 * hostNameValidator("example.com")     // returns undefined (valid)
 * hostNameValidator("my-server.local") // returns undefined (valid)
 * hostNameValidator("-invalid.com")    // returns "Enter a valid hostname"
 * hostNameValidator("invalid-.com")    // returns "Enter a valid hostname"
 */
export const hostNameValidator = (hostname: string): string | undefined => {
  const hostnameRegex =
    /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;

  if (!isUndefined(hostname)) {
    const matches = hostname.match(hostnameRegex);
    return !isNil(matches) && matches.length > 0
      ? undefined
      : "Enter a valid hostname";
  }
};
