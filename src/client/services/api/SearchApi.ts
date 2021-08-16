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

function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  console.log("results", results);
  SocketService.disconnect();
  return results;
};
