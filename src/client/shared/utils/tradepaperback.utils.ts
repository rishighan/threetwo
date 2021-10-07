import { flatten, compact, map, isEmpty } from "lodash";

export const detectIssueTypes = (deck: string): any => {
  const issueTypeMatchers = [
    {
      regex: [
        /((trade)?\s?(paperback)|(tpb))/gim, // https://regex101.com/r/FhuowT/1
        /(hard\s?cover)\s?(collect((ion)|(ed)|(ing)))/gim, //https://regex101.com/r/eFJVRM/1
      ],
      displayName: "Trade Paperback",
    },
    { regex: [/mini\Wseries/gim], displayName: "Mini-Series" },
  ];

  const matches = map(issueTypeMatchers, (matcher) => {
    return getIssueTypeDisplayName(deck, matcher.regex, matcher.displayName);
  });
  return compact(matches)[0];
};

const getIssueTypeDisplayName = (
  deck: string,
  regexPattern: RegExp[],
  displayName: string,
) => {
  const matches = [...regexPattern]
    .map((regex) => {
      return deck.match(regex);
    })
    .map((item) => {
      if (item !== undefined) {
        return item;
      }
    });
  const results = flatten(compact(matches));
  if (!isEmpty(results)) {
    return { displayName, results };
  }
};
