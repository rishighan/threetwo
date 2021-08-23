import SocketService from "../services/DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import {
  AIRDCPP_SEARCH_RESULTS_RECEIVED,
  AIRDCPP_HUB_SEARCHES_SENT,
  AIRDCPP_RESULT_DOWNLOAD_INITIATED,
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
      dispatch({
        type: AIRDCPP_HUB_SEARCHES_SENT,
        searchInfo,
        instance,
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

export const downloadAirDCPPItem =
  (instanceId: string, resultId: string): void =>
  async (dispatch) => {
    await SocketService.connect("admin", "password", true);
    const downloadResult = await SocketService.post(
      `search/${instanceId}/results/${resultId}/download`,
    );
    dispatch({
      type: AIRDCPP_RESULT_DOWNLOAD_INITIATED,
      downloadResult: downloadResult,
    });
    SocketService.disconnect();
  };
