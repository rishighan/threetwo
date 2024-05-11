import { filter, isEmpty, isNil, isUndefined, min, minBy } from "lodash";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { escapePoundSymbol } from "./formatting.utils";

export const determineCoverFile = (data): any => {
  /* For a payload like this:
  const foo = {
    rawFileDetails: {}, // #1
    wanted: {}, 
    comicInfo: {},
    comicvine: {}, // #2
    locg: {}, // #3
  };
  */
  const coverFile = {
    rawFile: {
      objectReference: "rawFileDetails",
      priority: 1,
      url: "",
      issueName: "",
      publisher: "",
    },
    wanted: {
      objectReference: "wanted",
      priority: 2,
      url: "",
      issueName: "",
      publisher: "",
    },
    comicvine: {
      objectReference: "comicvine",
      priority: 3,
      url: "",
      issueName: "",
      publisher: "",
    },
    locg: {
      objectReference: "locg",
      priority: 4,
      url: "",
      issueName: "",
      publisher: "",
    },
  };
  // comicvine
  if (!isEmpty(data.comicvine)) {
    coverFile.comicvine.url = data?.comicvine?.image.small_url;
    coverFile.comicvine.issueName = data.comicvine.name;
    coverFile.comicvine.publisher = data.comicvine.publisher.name;
  }
  // rawFileDetails
  if (!isEmpty(data.rawFileDetails)) {
    const encodedFilePath = encodeURI(
      `${LIBRARY_SERVICE_HOST}/${data.rawFileDetails.cover.filePath}`,
    );
    coverFile.rawFile.url = escapePoundSymbol(encodedFilePath);
    coverFile.rawFile.issueName = data.rawFileDetails.name;
  }
  // wanted

  if (!isUndefined(data.locg)) {
    coverFile.locg.url = data.locg.cover;
    coverFile.locg.issueName = data.locg.name;
    coverFile.locg.publisher = data.locg.publisher;
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

export const determineExternalMetadata = (
  metadataSource: string,
  source: any,
): any => {
  if (!isNil(source)) {
    switch (metadataSource) {
      case "comicvine":
        return {
          coverURL:
            source.comicvine?.image.small_url ||
            source.comicvine.volumeInformation?.image.small_url,
          issue: source.comicvine.name,
          icon: "cvlogo.svg",
        };
      case "locg":
        return {
          coverURL: source.locg.cover,
          issue: source.locg.name,
          icon: "locglogo.svg",
        };
      case undefined:
        return {};

      default:
        break;
    }
  }
  return null;
};
