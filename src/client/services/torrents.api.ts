import { emptySplitApi } from "./empty.api";

export const torrentsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    connectToQBittorrentClient: builder.query({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBQ) => {
        const qBittorrentHostInfo = await fetchWithBQ(
          "localhost:3000/api/settings/getAllSettings",
        );
        await fetchWithBQ({
          url: "localhost:3060/api/qbittorrent/connect",
          method: "POST",
          data: qBittorrentHostInfo,
        });
        console.log(qBittorrentHostInfo);
        return {
          url: "",
          method: "GET",
          data: qBittorrentHostInfo,
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useConnectToQBittorrentClientQuery } = torrentsApi;
