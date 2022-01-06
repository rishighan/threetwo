import axios from "axios";
import { isNil } from "lodash";
import { METRON_SERVICE_URI } from "../constants/endpoints";

export const fetchMetronResource = async (options) => {
  const metronResourceResults = await axios.post(
    `${METRON_SERVICE_URI}/fetchResource`,
    options,
  );
  console.log(metronResourceResults);
  console.log("has more? ", !isNil(metronResourceResults.data.next));
  const results = metronResourceResults.data.results.map((result) => {
    return {
      label: result.name,
      value: result.id,
    };
  });

  return {
    options: results,
    hasMore: !isNil(metronResourceResults.data.next),
    additional: {
      page: !isNil(metronResourceResults.data.next)
        ? options.query.page + 1
        : null,
    },
  };
};
