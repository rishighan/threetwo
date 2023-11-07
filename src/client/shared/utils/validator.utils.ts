import { isNil, isUndefined } from "lodash";

export const hostNameValidator = (hostname: string): string | undefined => {
  // https://stackoverflow.com/a/3824105/656708
  const hostnameRegex =
    /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;

  if (!isUndefined(hostname)) {
    const matches = hostname.match(hostnameRegex);
    return !isNil(matches) && matches.length > 0
      ? undefined
      : "Enter a valid hostname";
  }
};
