import { default as unzipper } from "unzipper";
const sharp = require("sharp");
const unrarer = require("node-unrar-js");
const Walk = require("@root/walk");
import fs from "fs";
import path from "path";
import { logger } from "./logger.utils";
import {
  IExtractComicBookCoverErrorResponse,
  IExtractedComicBookCoverFile,
  IExtractionOptions,
  IFolderData,
} from "../interfaces/folder.interface";

export const unrar = async (
  extractionOptions: IExtractionOptions,
): Promise<
  IExtractedComicBookCoverFile | IExtractComicBookCoverErrorResponse
> => {
  const comicCoversTargetPath =
    extractionOptions.sourceFolder +
    extractionOptions.targetComicCoversFolder +
    "/";
  const buf = Uint8Array.from(
    fs.readFileSync(
      extractionOptions.folderDetails.containedIn +
        "/" +
        extractionOptions.folderDetails.name,
    ),
  ).buffer;
  const extractor = await unrarer.createExtractorFromData({ data: buf });
  switch (extractionOptions.extractTarget) {
    // extract the first file only
    case "cover":
      const list = extractor.getFileList();
      const fileHeaders = [...list.fileHeaders];
      const file = extractor.extract({ files: [fileHeaders[0].name] });

      const extractedFile = [...file.files][0];
      const fileArrayBuffer = extractedFile.extraction;

      logger.info(`Attempting to write ${extractedFile.fileHeader.name}`);

      return new Promise((resolve, reject) => {
        fs.writeFile(
          comicCoversTargetPath + extractedFile.fileHeader.name,
          fileArrayBuffer,
          (err) => {
            if (err) {
              logger.error("Failed to write file", err);
              reject(err);
            } else {
              logger.info(
                `The file ${extractedFile.fileHeader.name} was saved to disk.`,
              );
              resolve({
                name: `${extractedFile.fileHeader.name}`,
                path: comicCoversTargetPath,
                fileSize: extractedFile.fileHeader.packSize,
              });
            }
          },
        );
      });
    case "all":
      const files = extractor.extract({});

      const extractedFiles = [...files.files];
      console.log(extractedFiles);

      // logger.info(`Attempting to write ${extractedFiles.fileHeader.name}`);

      // return new Promise((resolve, reject) => {
      //   fs.writeFile(
      //     comicCoversTargetPath + extractedFiles.fileHeader.name,
      //     filesBuffer,
      //     (err) => {
      //       if (err) {
      //         logger.error("Failed to write file", err);
      //         reject(err);
      //       } else {
      //         logger.info(
      //           `The file ${extractedFile.fileHeader.name} was saved to disk.`,
      //         );
      //         resolve({
      //           name: `${extractedFile.fileHeader.name}`,
      //           path: comicCoversTargetPath,
      //           fileSize: extractedFile.fileHeader.packSize,
      //         });
      //       }
      //     },
      //   );
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
): Promise<
  | IExtractedComicBookCoverFile
  | IExtractedComicBookCoverFile[]
  | IExtractComicBookCoverErrorResponse
> => {
  const sourceFolder = "./comics/";
  const targetComicCoversFolder = "covers";
  const extractionOptions: IExtractionOptions = {
    folderDetails: fileObject,
    extractTarget: "all",
    sourceFolder,
    targetComicCoversFolder,
  };
  switch (fileObject.extension) {
    case ".cbz":
      return await unzip("j");
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
