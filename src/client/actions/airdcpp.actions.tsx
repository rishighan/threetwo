import SocketService from "../services/DcppSearchService";
import { SearchQuery, SearchInstance, PriorityEnum } from "threetwo-ui-typings";
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
  const instance: SearchInstance = await SocketService.post("search");

  dispatch({
    type: AIRDCPP_SEARCH_INSTANCE_CREATED,
    searchInstance: instance,
  });

  const unsubscribe = await SocketService.addListener(
    "search",
    "search_hub_searches_sent",
    (searchInfo) => {
      onSearchSent(data, instance, unsubscribe, searchInfo);
    },
    instance.id,
  );

  const searchQueueInfo = await SocketService.post(
    `search/${instance.id}/hub_search`,
    data,
  );
  return searchQueueInfo;
};

const onSearchSent =
  (item, instance, unsubscribe, searchInfo) => async (dispatch) => {
    // Collect the results for 5 seconds
    await sleep(5000);

    // Get only the first result (results are sorted by relevance)
    const results = await SocketService.get(
      `search/${instance.id}/results/0/100`,
    );

    if (results.length > 0) {
      // We have results, download the best one
      console.log("SASAAAA", results);
      dispatch({
        type: AIRDCPP_SEARCH_RESULTS_RECEIVED,
        results,
      });
      // const result = results[0];
      // SocketService.post(`search/${instance.id}/results/${result.id}/download`, {
      //   priority: Utils.toApiPriority(item.priority),
      //   target_directory: item.target_directory,
      // });
    }
    // Remove listener for this search instance
    unsubscribe();
  };
