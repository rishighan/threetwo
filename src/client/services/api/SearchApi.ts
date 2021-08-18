import SocketService from "../DcppSearchService";
import {
  SearchQuery,
  SearchInstance,
  PriorityEnum,
  SearchResponse,
} from "threetwo-ui-typings";
import SearchConstants from "../../constants/search.constants";

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
  const instance: SearchInstance = await SocketService.post("search");
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
};

const onSearchSent = async (item, instance, unsubscribe, searchInfo): any => {
  // Collect the results for 5 seconds
  await sleep(5000);

  // Get only the first result (results are sorted by relevance)
  const results = await SocketService.get(
    `search/${instance.id}/results/0/100`,
  );

  if (results.length > 0) {
    // We have results, download the best one
    console.log("SASAAAA", results);
    // const result = results[0];
    // SocketService.post(`search/${instance.id}/results/${result.id}/download`, {
    //   priority: Utils.toApiPriority(item.priority),
    //   target_directory: item.target_directory,
    // });
  }
  return results;
  // Remove listener for this search instance
  unsubscribe();
};
