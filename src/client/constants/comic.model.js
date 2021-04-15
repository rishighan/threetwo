export const comicModel = {
  name: "",
  type: "",
  import: {
    isImported: false,
  },
  userAddedMetadata: {
    tags: [],
  },

  comicStructure: {
    cover: {
      thumb: "http://thumb",
      medium: "http://medium",
      large: "http://large",
    },
    collection: {
      publishDate: "",
      type: "", // issue, series, trade paperback
      metadata: {
        publisher: "",
        issueNumber: "",
        description: "",
        synopsis: "",
        team: {},
      },
    },
  },
  sourcedMetadata: {
    comicvine: {},
    shortboxed: {},
    gcd: {},
  },
  rawFileDetails: {
    fileName: "",
    path: "",
    extension: "",
  },
  acquisition: {
    release: {},
    torrent: {
      magnet: "",
      tracker: "",
      status: "",
    },
    usenet: {},
  },
};
