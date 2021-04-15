import unrarer from "node-unrar-js";
import { default as unzipper } from "unzipper";
const etl = require("etl");
const Walk = require("@root/walk");
import fs from "fs";
import path from "path";
import { logger } from "./logger.utils";
import { IFolderData } from "../interfaces/folder.interface";

export const unrar = async (filePath) => {
  const buf = Uint8Array.from(
    fs.readFileSync("./comics/The Squidder (2015) (Digital-Empire).cbr"),
  ).buffer;
  const extractor = await unrarer.createExtractorFromData({ data: buf });
  const list = extractor.getFileList();
  const fileHeaders = [...list.fileHeaders];
  const extracted = extractor.extract({ files: [fileHeaders[0].name] });
  const files = [...extracted.files]; //load the files
  return files[0];
};

export const unzip = () => {
  fs.createReadStream("./comics/30 Days of Night 01-003.cbz")
    .pipe(unzipper.ParseOne())
    .pipe(etl.toFile("./comics/covers/cover.jpg"))
    .promise()
    .then(() => {
      logger.info("done");
    })
    .catch((e) => {
      logger.info("error", e);
    });
};

export const extractArchive = async (pathName) => {
  const extractedFile = await unrar("./comics");
  const myBuffer = extractedFile.extraction;
  logger.info(`Attempting to write ${extractedFile.fileHeader.name}`);
  fs.writeFile(pathName + extractedFile.fileHeader.name, myBuffer, (err) => {
    if (err) {
      logger.error("Failed to write file", err);
    } else {
      logger.info(
        `The file ${extractedFile.fileHeader.name} was saved to disk.`,
      );
    }
  });
};

export const walkFolder = async (folder: string): Promise<[IFolderData]> => {
  const result: IFolderData[] = [];
  return await Walk.walk(folder, async (err, pathname, dirent) => {
    // err is failure to lstat a file or directory
    // pathname is relative path, including the file or folder name
    // dirent = { name, isDirectory(), isFile(), isSymbolicLink(), ... }

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
};
