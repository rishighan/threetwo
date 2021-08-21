import SocketService from "../services/DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import {
  AIRDCPP_SEARCH_INSTANCE_CREATED,
  AIRDCPP_SEARCH_RESULTS_RECEIVED,
} from "../constants/action-types";

interface SearchData {
  query: Pick<SearchQuery, "pattern"> & Partial<Omit<SearchQuery, "pattern">>;
  hub_urls: string[] | undefined | null;
  priority: PriorityEnum;
}

function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const search = (data: SearchData) => async (dispatch) => {
  await SocketService.connect("admin", "password");
  await sleep(10000);
  const instance: SearchInstance = await SocketService.post("search");
  await SocketService.post<SearchResponse>(
    `search/${instance.id}/hub_search`,
    data,
  );
  await sleep(10000);
  const results = await SocketService.get(`search/${instance.id}/results/0/25`);
  console.log("results", results);
  dispatch({
    type: AIRDCPP_SEARCH_RESULTS_RECEIVED,
    results,
  });
  SocketService.disconnect();
  return results;
};
