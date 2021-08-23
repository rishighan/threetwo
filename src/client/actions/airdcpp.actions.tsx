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
  AIRDCPP_HUB_SEARCHES_SENT,
  AIRDCPP_HUB_USER_CONNECTED,
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
  await SocketService.connect("admin", "password", true);
  const instance: SearchInstance = await SocketService.post("search");

  SocketService.addListener(
    `search/${instance.id}`,
    "search_hub_searches_sent",
    async (searchInfo) => {
        console.log("As", searchInfo)
      // Collect the results for 5 seconds before fetching them
      dispatch({
        type: AIRDCPP_HUB_SEARCHES_SENT,
      });
    },
  );

  await SocketService.post<SearchResponse>(
    `search/${instance.id}/hub_search`,
    data,
  );

  await sleep(10000);
  const results = await SocketService.get(`search/${instance.id}/results/0/25`);
  dispatch({
    type: AIRDCPP_SEARCH_RESULTS_RECEIVED,
    results,
  });
  SocketService.disconnect();
  return results;
};
