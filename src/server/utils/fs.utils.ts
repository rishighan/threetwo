import { default as unzipper } from "unzipper";
const etl = require("etl");
const sharp = require("sharp");
const imgHash = require("imghash");
const stream = require("stream");
const unrarer = require("node-unrar-js");
const Walk = require("@root/walk");
import fs from "fs";
import path from "path";
import { logger } from "./logger.utils";
import {
  IExtractedComicBookCoverFile,
  IFolderData,
} from "../interfaces/folder.interface";

export const unrar = async (
  filePath: string,
): Promise<IExtractedComicBookCoverFile> => {
  const buf = Uint8Array.from(
    fs.readFileSync(
      "./comics/Ghosts and Ruins (2013) (digital) (Mr Norrell-Empire).cbr",
    ),
  ).buffer;
  const extractor = await unrarer.createExtractorFromData({ data: buf });
  const list = extractor.getFileList();
  const fileHeaders = [...list.fileHeaders];
  // extract the first file only
  const extracted = extractor.extract({ files: [fileHeaders[0].name] });
  const files = [...extracted.files];
  const extractedFile = files[0];
  const myBuffer = extractedFile.extraction;

  logger.info(`Attempting to write ${extractedFile.fileHeader.name}`);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath + extractedFile.fileHeader.name, myBuffer, (err) => {
      if (err) {
        logger.error("Failed to write file", err);
        reject(err);
      } else {
        logger.info(
          `The file ${extractedFile.fileHeader.name} was saved to disk.`,
        );
        resolve({
          name: `${extractedFile.fileHeader.name}`,
          path: `${filePath}`,
          fileSize: `${extractedFile.fileHeader.packSize}`,
        });
      }
    });
  });
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
  filePath: string,
): Promise<IExtractedComicBookCoverFile> => {
  let foo: IExtractedComicBookCoverFile = { name: "", path: "", fileSize: "" };
  const zip = fs
    .createReadStream(
      "./comics/Lovecraft - The Myth of Cthulhu (2018) (Maroto) (fylgja).cbz",
    )
    .pipe(unzipper.Parse({ forceStream: true }));
  for await (const entry of zip) {
    const fileName = entry.path;
    const type = entry.type; // 'Directory' or 'File'
    const size = entry.vars.uncompressedSize; // There is also compressedSize;
    foo = {
      name: fileName,
      fileSize: size,
      path: filePath,
    };
    entry.pipe(fs.createWriteStream("./comics/covers/cover.jpg"));
    entry.autodrain();
  }
  return new Promise((resolve, reject) => {
    resolve(foo);
  });
};

export const extractArchive = async (
  fileObject: IFolderData,
): Promise<void> => {
  switch (fileObject.extension) {
    case ".cbz":
      break;
    case ".cbr":
      break;
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
