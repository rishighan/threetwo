import SocketService from "../utils/airdcpp.socket.service";
export const foo = SocketService.connect("admin", "password");
interface SearchInstance {
  current_search_id: string;
  expires_in: number;
  id: number;
  owner: string;
  query: Record<string, unknown>;
  queue_time: number;
  queued_count: number;
  result_count: number;
  searches_sent_ago: number;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

foo.then(async (data) => {
  const instance: SearchInstance = await SocketService.post("search");
  await sleep(10000);

  const searchInfo = await SocketService.post(
    `search/${instance.id}/hub_search`,
    {
      query: {
        pattern: "H.P. Lovecraft",
        file_type: "compressed",
        extensions: ["cbz", "cbr"],
      },
      hub_urls: [
        "nmdcs://piter.feardc.net:411",
        "dchub://dc.rutrack.net",
        "dchub://dc.elitedc.ru",
      ],
      priority: 1,
    },
  );
  await sleep(10000);
  const results = await SocketService.get(`search/${instance.id}/results/0/5`);
  console.log(results);
});
