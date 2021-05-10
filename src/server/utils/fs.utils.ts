/*
 * MIT License
 *
 * Copyright (c) 2021 Rishi Ghan
 *
 The MIT License (MIT)

Copyright (c) 2021 Rishi Ghan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
 */

/*
 * Revision History:
 *     Initial:        2021/05/04        Rishi Ghan
 */

const sharp = require("sharp");
const unrarer = require("node-unrar-js");
const Walk = require("@root/walk");
const fse = require("fs-extra");

import { default as unzipper } from "unzipper";
import _ from "lodash";
import { createReadStream, createWriteStream } from "fs";
const { writeFile, readFile } = require("fs").promises;
import path from "path";
import { each, isEmpty, map, remove, indexOf } from "lodash";
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
  walkedFolder: IFolderData,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  const paths = constructPaths(extractionOptions, walkedFolder);
  const directoryOptions = {
    mode: 0o2775,
  };
  const fileBuffer = await readFile(paths.inputFilePath).catch((err) =>
    console.error("Failed to read file", err),
  );
  try {
    await fse.ensureDir(paths.targetPath, directoryOptions);
    logger.info(`${paths.targetPath} was created.`);
  } catch (error) {
    logger.error(`${error}: Couldn't create directory.`);
  }

  const extractor = await unrarer.createExtractorFromData({ data: fileBuffer });

  switch (extractionOptions.extractTarget) {
    case "cover":
      return new Promise(async (resolve, reject) => {
        try {
          let fileNameToExtract = "";
          const list = extractor.getFileList();
          const fileHeaders = [...list.fileHeaders];
          each(fileHeaders, async (fileHeader) => {
            const fileName = explodePath(fileHeader.name).fileName;
            if (
              fileName !== "" &&
              fileHeader.flags.directory === false &&
              isEmpty(fileNameToExtract)
            ) {
              logger.info(`Attempting to write ${fileHeader.name}`);
              fileNameToExtract = fileHeader.name;
              const file = extractor.extract({ files: [fileHeader.name] });
              const extractedFile = [...file.files][0];
              const fileArrayBuffer = extractedFile.extraction;
              await writeFile(
                paths.targetPath + "/" + fileName,
                fileArrayBuffer,
              );
              resolve({
                name: `${fileName}`,
                path: paths.targetPath,
                fileSize: fileHeader.packSize,
              });
            }
          });
        } catch (error) {
          logger.error(`${error}: Couldn't write file.`);
          reject(error);
        }
      });

    case "all":
      return new Promise(async (resolve, reject) => {
        try {
          const files = extractor.extract({});
          const extractedFiles = [...files.files];
          const comicBookCoverFiles: IExtractedComicBookCoverFile[] = [];
          for (const file of extractedFiles) {
            logger.info(`Attempting to write ${file.fileHeader.name}`);
            const fileBuffer = file.extraction;
            const fileName = explodePath(file.fileHeader.name).fileName;

            if (fileName !== "" && file.fileHeader.flags.directory === false) {
              await writeFile(paths.targetPath + "/" + fileName, fileBuffer);
            }
            comicBookCoverFiles.push({
              name: `${file.fileHeader.name}`,
              path: paths.targetPath,
              fileSize: file.fileHeader.packSize,
            });
          }
          resolve(_.flatten(comicBookCoverFiles));
        } catch (error) {
          resolve({
            message: `${error}`,
            errorCode: "500",
            data: walkedFolder.name,
          });
        }
      });

    default:
      return {
        message: "File format not supported, yet.",
        errorCode: "90",
        data: "asda",
      };
  }
};

export const unzip = async (
  extractionOptions: IExtractionOptions,
  walkedFolder: IFolderData,
): Promise<
  | IExtractedComicBookCoverFile[]
  | IExtractedComicBookCoverFile
  | IExtractComicBookCoverErrorResponse
> => {
  const directoryOptions = {
    mode: 0o2775,
  };
  const paths = constructPaths(extractionOptions, walkedFolder);

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
      logger.info(`Attempting to write ${fileName}`);
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
    resolve(_.flatten(extractedFiles));
  });
};

export const extractArchive = async (
  extractionOptions: IExtractionOptions,
  walkedFolder: IFolderData,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  switch (walkedFolder.extension) {
    case ".cbz":
      return await unzip(extractionOptions, walkedFolder);
    case ".cbr":
      return await unrar(extractionOptions, walkedFolder);
    default:
      return {
        message: "File format not supported, yet.",
        errorCode: "90",
        data: `${extractionOptions}`,
      };
  }
};

export const getCovers = async (
  options: IExtractionOptions,
  walkedFolders: Array<IFolderData>,
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractComicBookCoverErrorResponse
  | IExtractedComicBookCoverFile[]
  | (
      | IExtractedComicBookCoverFile
      | IExtractComicBookCoverErrorResponse
      | IExtractedComicBookCoverFile[]
    )[]
  | IExtractComicBookCoverErrorResponse
> => {
  switch (options.extractionMode) {
    case "bulk":
      const extractedDataPromises = map(walkedFolders, async (folder) => {
        return await extractArchive(options, folder);
      });
      return Promise.all(extractedDataPromises).then((data) => _.flatten(data));
    case "single":
      return await extractArchive(options, walkedFolders[0]);
    default:
      logger.error("Unknown extraction mode selected.");
      return {
        message: "Unknown extraction mode selected.",
        errorCode: "90",
        data: `${options}`,
      };
  }
};

export const walkFolder = async (folder: string): Promise<IFolderData[]> => {
  const result: IFolderData[] = [];
  let walkResult: IFolderData = {
    name: "",
    extension: "",
    containedIn: "",
    isFile: false,
    isLink: true,
  };

  const walk = Walk.create({ sort: filterOutDotFiles });
  await walk(folder, async (err, pathname, dirent) => {
    if (err) {
      logger.error("Failed to lstat directory", { error: err });
      return false;
    }
    if ([".cbz", ".cbr"].includes(path.extname(dirent.name))) {
      walkResult = {
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
    }
  });
  return result;
};

export const explodePath = (filePath: string): IExplodedPathResponse => {
  const exploded = filePath.split("/");
  const fileName = remove(exploded, (item) => {
    return indexOf(exploded, item) === exploded.length - 1;
  }).join("");

  return {
    exploded,
    fileName,
  };
};

const constructPaths = (
  extractionOptions: IExtractionOptions,
  walkedFolder: IFolderData,
) => {
  return {
    targetPath:
      extractionOptions.targetExtractionFolder + "/" + walkedFolder.name,
    inputFilePath:
      walkedFolder.containedIn +
      "/" +
      walkedFolder.name +
      walkedFolder.extension,
  };
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

const filterOutDotFiles = (entities) => {
  return entities.filter((ent) => !ent.name.startsWith("."));
};
