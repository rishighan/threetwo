import { default as unzipper } from "unzipper";
const sharp = require("sharp");
const unrarer = require("node-unrar-js");
const Walk = require("@root/walk");
import fs from "fs";
import path from "path";
import { logger } from "./logger.utils";
import {
  IExtractedComicBookCoverFile,
  IExtractionOptions,
  IFolderData,
} from "../interfaces/folder.interface";

export const unrar = async (
  extractionOptions: IExtractionOptions,
): Promise<IExtractedComicBookCoverFile> => {
  const buf = Uint8Array.from(
    fs.readFileSync(
      extractionOptions.sourceFolder + extractionOptions.folderDetails.name,
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
          fileSize: extractedFile.fileHeader.packSize,
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
): Promise<IExtractedComicBookCoverFile[]> => {
  const extractedFiles: IExtractedComicBookCoverFile[] = [];
  const zip = fs
    .createReadStream(
      "./comics/Lovecraft - The Myth of Cthulhu (2018) (Maroto) (fylgja).cbz",
    )
    .pipe(unzipper.Parse({ forceStream: true }));
  for await (const entry of zip) {
    const fileName = entry.path;
    const size = entry.vars.uncompressedSize; // There is also compressedSize;
    extractedFiles.push({
      name: fileName,
      fileSize: size,
      path: filePath,
    });
    entry.pipe(fs.createWriteStream("./comics/covers/" + fileName));
    entry.autodrain();
  }
  return new Promise((resolve, reject) => {
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
      .pipe(fs.createWriteStream("./comics/covers/yelaveda.jpg"))
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
): Promise<IExtractedComicBookCoverFile | IExtractedComicBookCoverFile[]> => {
  const sourceFolder = "./comics/";
  const targetComicCoversFolder = "covers";
  const extractionOptions: IExtractionOptions = {
    ...fileObject,
    extractTarget: "cover",
    sourceFolder,
    targetComicCoversFolder,
  };
  switch (fileObject.extension) {
    case ".cbz":
      return await unzip(extractionOptions);
    case ".cbr":
      return await unrar(extractionOptions);
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
