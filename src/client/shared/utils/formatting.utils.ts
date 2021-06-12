export const removeLeadingPeriod = (input: string): string => {
  if (input.charAt(0) == ".") {
    input = input.substr(1);
  }
  return input;
};
