const sharp = require("sharp");
const unrarer = require("node-unrar-js");
const Walk = require("@root/walk");
const fse = require("fs-extra");

import { default as unzipper } from "unzipper";
import { createReadStream, createWriteStream } from "fs";
const { writeFile, readFile } = require("fs").promises;
import path from "path";
import _ from "lodash";
import { logger } from "./logger.utils";
import {
  IExplodedPathResponse,
  IExtractComicBookCoverErrorResponse,
  IExtractedComicBookCoverFile,
  IExtractionOptions,
  IFolderData,
} from "../interfaces/folder.interface";

export const unrar = async (
  extractionOptions: IExtractionOptions,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  const paths = constructPaths(extractionOptions);
  const directoryOptions = {
    mode: 0o2775,
  };
  const fileBuffer = await readFile(paths.inputFilePath).catch((err) =>
    console.error("Failed to read file", err),
  );

  try {
    await fse.ensureDir(paths.targetPath, directoryOptions);
    logger.info(`${paths.targetPath} was created or already exists.`);
  } catch (error) {
    logger.error(`${error}: Couldn't create directory.`);
  }

  const extractor = await unrarer.createExtractorFromData({ data: fileBuffer });
  switch (extractionOptions.extractTarget) {
    case "cover":
      const list = extractor.getFileList();
      const fileHeaders = [...list.fileHeaders];
      const file = extractor.extract({ files: [fileHeaders[0].name] });
      const extractedFile = [...file.files][0];
      const fileArrayBuffer = extractedFile.extraction;

      logger.info(`Attempting to write ${extractedFile.fileHeader.name}`);

      return new Promise(async (resolve, reject) => {
        try {
          const fileName = explodePath(extractedFile.fileHeader.name).fileName;
          if (
            fileName !== "" &&
            extractedFile.fileHeader.flags.directory === false
          ) {
            await writeFile(paths.targetPath + "/" + fileName, fileArrayBuffer);
          }
          resolve({
            name: `${extractedFile.fileHeader.name}`,
            path: paths.targetPath,
            fileSize: extractedFile.fileHeader.packSize,
          });
        } catch (error) {
          logger.error(`${error}: Couldn't write file.`);
          reject(error);
        }
      });
    case "all":
      const files = extractor.extract({});
      const extractedFiles = [...files.files];

      return new Promise(async (resolve, reject) => {
        const comicBookCoverFiles: IExtractedComicBookCoverFile[] = [];
        for (const file of extractedFiles) {
          logger.info(`Attempting to write ${file.fileHeader.name}`);
          const fileBuffer = file.extraction;
          const fileName = explodePath(file.fileHeader.name).fileName;
          try {
            if (fileName !== "" && file.fileHeader.flags.directory === false) {
              await writeFile(paths.targetPath + "/" + fileName, fileBuffer);
            }
            comicBookCoverFiles.push({
              name: `${file.fileHeader.name}`,
              path: paths.targetPath,
              fileSize: file.fileHeader.packSize,
            });
          } catch (error) {
            logger.error(error);
            reject(error);
          }
        }
        resolve(comicBookCoverFiles);
      });

    default:
      return {
        message: "File format not supported, yet.",
        errorCode: "90",
        data: "asda",
      };
  }
};

export const extractMetadataFromImage = async (
  imageFilePath: string,
): Promise<unknown> => {
  const image = await sharp(imageFilePath)
    .metadata()
    .then(function (metadata) {
      return metadata;
    });
  return image;
};

export const unzip = async (
  extractionOptions: IExtractionOptions,
): Promise<
  | IExtractedComicBookCoverFile[]
  | IExtractedComicBookCoverFile
  | IExtractComicBookCoverErrorResponse
> => {
  const directoryOptions = {
    mode: 0o2775,
  };
  const paths = constructPaths(extractionOptions);

  try {
    await fse.ensureDir(paths.targetPath, directoryOptions);
    logger.info(`${paths.targetPath} was created or already exists.`);
  } catch (error) {
    logger.error(`${error} Couldn't create directory.`);
  }

  const extractedFiles: IExtractedComicBookCoverFile[] = [];
  const zip = createReadStream(paths.inputFilePath).pipe(
    unzipper.Parse({ forceStream: true }),
  );
  for await (const entry of zip) {
    const fileName = explodePath(entry.path).fileName;
    const size = entry.vars.uncompressedSize;
    if (
      extractedFiles.length === 1 &&
      extractionOptions.extractTarget === "cover"
    ) {
      break;
    }
    if (fileName !== "" && entry.type !== "Directory") {
      entry.pipe(createWriteStream(paths.targetPath + "/" + fileName));
      extractedFiles.push({
        name: fileName,
        fileSize: size,
        path: paths.targetPath,
      });
    }
    entry.autodrain();
  }

  return new Promise(async (resolve, reject) => {
    logger.info("");
    resolve(extractedFiles);
  });
};

export const extractArchive = async (
  fileObject: IFolderData,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  const sourceFolder = "./comics";
  const targetExtractionFolder = "covers";
  const extractionOptions: IExtractionOptions = {
    folderDetails: fileObject,
    extractTarget: "cover",
    sourceFolder,
    targetExtractionFolder,
  };
  switch (fileObject.extension) {
    case ".cbz":
      return await unzip(extractionOptions);
    case ".cbr":
      return await unrar(extractionOptions);
    default:
      return {
        message: "File format not supported, yet.",
        errorCode: "90",
        data: "asda",
      };
  }
};

export const walkFolder = async (folder: string): Promise<IFolderData[]> => {
  const result: IFolderData[] = [];
  await Walk.walk(folder, async (err, pathname, dirent) => {
    if (err) {
      logger.error("Failed to lstat directory", { error: err });
      return false;
    }
    const walkResult = {
      name: path.basename(dirent.name, path.extname(dirent.name)),
      extension: path.extname(dirent.name),
      containedIn: path.dirname(pathname),
      isFile: dirent.isFile(),
      isLink: dirent.isSymbolicLink(),
    };
    logger.info(
      `Scanned ${dirent.name} contained in ${path.dirname(pathname)}`,
    );
    result.push(walkResult);
  });
  return result;
};

export const explodePath = (filePath: string): IExplodedPathResponse => {
  const exploded = filePath.split("/");
  const fileName = _.remove(exploded, (item) => {
    return _.indexOf(exploded, item) === exploded.length - 1;
  }).join("");

  return {
    exploded,
    fileName,
  };
};

const constructPaths = (extractionOptions: IExtractionOptions) => {
  return {
    targetPath:
      extractionOptions.sourceFolder +
      "/" +
      extractionOptions.targetExtractionFolder +
      "/" +
      extractionOptions.folderDetails.name,
    inputFilePath:
      extractionOptions.folderDetails.containedIn +
      "/" +
      extractionOptions.folderDetails.name +
      extractionOptions.folderDetails.extension,
  };
};
