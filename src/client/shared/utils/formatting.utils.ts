export const removeLeadingPeriod = (input: string): string => {
  if (input.charAt(0) == ".") {
    input = input.substr(1);
  }
  return input;
};

export const escapePoundSymbol = (input: string): string => {
  console.log(input.replace(/\#/gi, "%23"));
  return input.replace(/\#/gi, "%23");
};
