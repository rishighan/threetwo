import axios from "axios";
import { METRON_SERVICE_URI } from "../constants/endpoints";

export const fetchMetronResource = async (options) => {
  console.log(options);

  const metronResourceResults = await axios.post(
    `${METRON_SERVICE_URI}/fetchResource`,
    options,
  );
  console.log(metronResourceResults);
  const foo = metronResourceResults.data.results.map((result) => {
    return {
      label: result.name,
      value: result.id,
    };
  });
  console.log({ options: foo, hasMore: false });
  return { options: foo, hasMore: false };
};
