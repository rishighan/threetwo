import { compact } from "lodash";

export const detectTradePaperbacks = (deck): any => {
  const paperback = [
    /((trade)?\s?(paperback)|(tpb))/gim, // https://regex101.com/r/FhuowT/1
    /(hard\s?cover)\s?(collect((ion)|(ed)|(ing)))/gim, //https://regex101.com/r/eFJVRM/1
  ];
  const miniSeries = [

  ]
  const matches = paperback
    .map((regex) => {
      return deck.match(regex);
    })
    .map((item) => {
      if (item !== undefined) {
        return item;
      }
    });
  console.log(compact(matches));
  return compact(matches);
};
