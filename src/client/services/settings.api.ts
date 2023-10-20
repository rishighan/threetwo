import { emptySplitApi } from "./empty.api";
import { useConnectToQBittorrentClientQuery } from "./torrents.api";

export const settingsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSettings: builder.query({
      query: () => "localhost:3000/api/settings/getAllSettings",
    }),
    getQBitTorrentClientInfo: builder.query({
      queryFn: async () => {
        try {
        } catch (err) {}
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllSettingsQuery } = settingsApi;
