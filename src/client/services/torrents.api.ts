import { emptySplitApi } from "./empty.api";

export const torrentsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    connectToQBittorrentClient: builder.query({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const {
            data: { bittorrent },
          } = await fetchWithBQ("localhost:3000/api/settings/getAllSettings");
          await fetchWithBQ({
            url: "localhost:3060/api/qbittorrent/connect",
            method: "POST",
            body: bittorrent?.client?.host,
          });
          const { data } = await fetchWithBQ({
            url: "localhost:3060/api/qbittorrent/getClientInfo",
            method: "GET",
          });

          return {
            data: { bittorrent, qbittorrentClientInfo: data },
          };
        } catch (err) {
          throw err;
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useConnectToQBittorrentClientQuery } = torrentsApi;
