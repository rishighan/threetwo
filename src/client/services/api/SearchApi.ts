import SocketService from "../DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import SearchConstants from "../../constants/search.service";

interface SearchData {
  query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
  hub_urls: string[] | undefined | null;
  priority: PriorityEnum;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// foo.then(async (data) => {
//   const instance: SearchInstance = await SocketService.post("search");
//   await sleep(10000);

//   const searchInfo = await SocketService.post(
//     `search/${instance.id}/hub_search`,
//     {
//       query: {
//         pattern: "H.P. Lovecraft",
//         file_type: "compressed",
//         extensions: ["cbz", "cbr"],
//       },
//       hub_urls: [
//         "nmdcs://piter.feardc.net:411",
//         "dchub://dc.rutrack.net",
//         "dchub://dc.elitedc.ru",
//       ],
//       priority: 1,
//     },
//   );
//   await sleep(10000);
//   const results = await SocketService.get(`search/${instance.id}/results/0/5`);
//   console.log(results);
// });

export const search = async (data: SearchData) => {
  await SocketService.connect("admin", "password");
  await sleep(10000);
  const instance: SearchInstance = await SocketService.post("search");
  await SocketService.post<SearchResponse>(
    `search/${instance.id}/hub_search`,
    data,
  );
  await sleep(10000);
  const results = await SocketService.get(`search/${instance.id}/results/0/5`);
  console.log("ASDASDASDASDASDASDA", results);
  SocketService.disconnect();
  return results;
};
