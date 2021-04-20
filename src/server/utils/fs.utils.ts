import { default as unzipper } from "unzipper";
const sharp = require("sharp");
const unrarer = require("node-unrar-js");
const Walk = require("@root/walk");
const fse = require("fs-extra");
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

  const extractor = await unrarer.createExtractorFromData({ data: fileBuffer });
  switch (extractionOptions.extractTarget) {
    case "cover":
      const list = extractor.getFileList();
      const fileHeaders = [...list.fileHeaders];
      const file = extractor.extract({ files: [fileHeaders[0].name] });

      const extractedFile = [...file.files][0];
      const fileArrayBuffer = extractedFile.extraction;
      const pathFragments = explodePath(extractedFile.fileHeader.name);
      const targetPath =
        extractionTargetPath + "/" + pathFragments.exploded.join("/");

      logger.info(`Attempting to write ${extractedFile.fileHeader.name}`);

      return new Promise(async (resolve, reject) => {
        try {
          await fse.ensureDir(targetPath, directoryOptions);
          logger.info(`${targetPath} was created or already exists.`);
          try {
            await writeFile(
              targetPath + "/" + pathFragments.fileName,
              fileArrayBuffer,
            );
            resolve({
              name: `${extractedFile.fileHeader.name}`,
              path: targetPath,
              fileSize: extractedFile.fileHeader.packSize,
            });
          } catch (error) {
            logger.error(`${error}: Couldn't write file.`);
            reject(error);
          }
        } catch (error) {
          logger.error(`${error}: Coudln't create directory.`);
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
          const pathFragments = explodePath(file.fileHeader.name);
          const fragment = determineFolderNameForExtraction(pathFragments);
          const targetPath = extractionTargetPath + "/" + fragment;
          try {
            await fse.ensureDir(targetPath, directoryOptions);
            logger.info(`${targetPath} was created or already exists.`);
            try {
              await writeFile(
                targetPath + "/" + pathFragments.fileName,
                fileBuffer,
              );
              comicBookCoverFiles.push({
                name: `${file.fileHeader.name}`,
                path: targetPath,
                fileSize: file.fileHeader.packSize,
              });
            } catch (error) {
              logger.error(error);
              reject(error);
            }
          } catch (err) {
            logger.error(err);
            reject(err);
          }
        }
        resolve(comicBookCoverFiles);
      });

    // });
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
): Promise<IExtractedComicBookCoverFile[]> => {
  const extractedFiles: IExtractedComicBookCoverFile[] = [];
  const directoryOptions = {
    mode: 0o2775,
  };
  const targetPath =
    extractionOptions.sourceFolder +
    "/" +
    extractionOptions.targetExtractionFolder;
  const zip = createReadStream(
    extractionOptions.sourceFolder + "/" + extractionOptions.folderDetails.name,
  ).pipe(unzipper.Parse({ forceStream: true }));
  for await (const entry of zip) {
    try {
      await fse.ensureDir(targetPath, directoryOptions);
      logger.info(`${targetPath} was created or already exists.`);
      const fileName = entry.path;
      const size = entry.vars.uncompressedSize; // There is also compressedSize;
      extractedFiles.push({
        name: fileName,
        fileSize: size,
        path: targetPath,
      });
      entry.pipe(createWriteStream(targetPath + fileName));
      entry.autodrain();
    } catch (error) {
      logger.error(`${error} Couldn't create directory.`);
    }
  }
  return new Promise((resolve, reject) => {
    logger.info("");
    resolve(extractedFiles);
  });
};

export const unzipOne = async (): Promise<IExtractedComicBookCoverFile> => {
  const directory = await unzipper.Open.file(
    "./comics/Lovecraft - The Myth of Cthulhu (2018) (Maroto) (fylgja).cbz",
  );
  return new Promise((resolve, reject) => {
    directory.files[0]
      .stream()
      .pipe(createWriteStream("./comics/covers/yelaveda.jpg"))
      .on("error", reject)
      .on("finish", () =>
        resolve({
          name: directory.files[0].path,
          fileSize: directory.files[0].uncompressedSize,
          path: "ll",
        }),
      );
  });
};

export const extractArchive = async (
  fileObject: IFolderData,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  const sourceFolder = "./comics/";
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
  });
  return {
    exploded,
    fileName,
  };
};

export const determineFolderNameForExtraction = (
  pathFragments: IExplodedPathResponse,
): string | string[] => {
  if (pathFragments.exploded.length === 0) {
    return pathFragments.fileName;
  } else {
    return pathFragments.exploded.join("/");
  }
};
