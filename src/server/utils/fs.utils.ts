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
import { WriteStream } from "node:fs";

export const unrar = async (
  extractionOptions: IExtractionOptions,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  const extractionTargetPath =
    extractionOptions.sourceFolder + extractionOptions.targetExtractionFolder;
  const directoryOptions = {
    mode: 0o2775,
  };
  const fileBuffer = await readFile(
    extractionOptions.folderDetails.containedIn +
      "/" +
      extractionOptions.folderDetails.name,
  ).catch((err) => console.error("Failed to read file", err));

  const targetPath =
    extractionTargetPath + "/" + extractionOptions.folderDetails.name;

  try {
    await fse.ensureDir(targetPath, directoryOptions);
    logger.info(`${targetPath} was created or already exists.`);
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
          if (fileName !== "") {
            await writeFile(targetPath + "/" + fileName, fileArrayBuffer);
          }
          resolve({
            name: `${extractedFile.fileHeader.name}`,
            path: targetPath,
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
            if (fileName !== "") {
              await writeFile(targetPath + "/" + fileName, fileBuffer);
            }
            comicBookCoverFiles.push({
              name: `${file.fileHeader.name}`,
              path: targetPath,
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
  const targetPath =
    extractionOptions.sourceFolder +
    "/" +
    extractionOptions.targetExtractionFolder +
    "/" +
    extractionOptions.folderDetails.name;

  const inputFilePath =
    extractionOptions.folderDetails.containedIn +
    "/" +
    extractionOptions.folderDetails.name +
    extractionOptions.folderDetails.extension;

  try {
    await fse.ensureDir(targetPath, directoryOptions);
    logger.info(`${targetPath} was created or already exists.`);
  } catch (error) {
    logger.error(`${error} Couldn't create directory.`);
  }

  const extractedFiles: IExtractedComicBookCoverFile[] = [];
  const zip = createReadStream(inputFilePath).pipe(
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
      entry.pipe(createWriteStream(targetPath + "/" + fileName));
      extractedFiles.push({
        name: fileName,
        fileSize: size,
        path: targetPath,
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
  const targetExtractionFolder = "expanded";
  const extractionOptions: IExtractionOptions = {
    folderDetails: fileObject,
    extractTarget: "all",
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
