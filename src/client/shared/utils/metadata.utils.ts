import { filter, isEmpty, isUndefined, min, minBy } from "lodash";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { escapePoundSymbol } from "./formatting.utils";

export const determineCoverFile = (data) => {
  /* For a payload like this:
  const foo = {
    rawFileDetails: {}, // #1
    comicInfo: {},
    comicvine: {}, // #2
    locg: {}, // #3
  };
  */
  const coverFile = {
    rawFile: {
      priority: 1,
      url: "",
      issueName: "",
    },
    comicvine: {
      priority: 2,
      url: "",
      issueName: "",
    },
    locg: {
      priority: 3,
      url: "",
      issueName: "",
    },
  };
  if (
    !isUndefined(data.comicvine) &&
    !isUndefined(data.comicvine.volumeInformation)
  ) {
    coverFile.comicvine.url = data.comicvine.image.small_url;
    coverFile.comicvine.issueName = data.comicvine.name;
  }
  if (!isEmpty(data.rawFileDetails.cover)) {
    const encodedFilePath = encodeURI(
      `${LIBRARY_SERVICE_HOST}/${data.rawFileDetails.cover.filePath}`,
    );
    coverFile.rawFile.url = escapePoundSymbol(encodedFilePath);
    coverFile.rawFile.issueName = data.rawFileDetails.name;
  }
  if (!isUndefined(data.locg)) {
    coverFile.locg.url = data.locg.cover;
    coverFile.locg.issueName = data.locg.name;
  }

  const result = filter(coverFile, (item) => item.url !== "");

  if (result.length > 1) {
    const highestPriorityCoverFile = minBy(result, (item) => item.priority);
    if (!isUndefined(highestPriorityCoverFile)) {
      return highestPriorityCoverFile;
    }
  } else {
    return result[0];
  }
};
