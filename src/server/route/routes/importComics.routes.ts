import router from "../router";
import {
  walkFolder,
  extractArchive,
  unrar,
  unzip,
  extractMetadataFromImage,
  unzipOne,
  explodePath,
} from "../../utils/fs.utils";
import { Request, Response } from "express";

router.route("/getComicCovers").get(async (req: Request, res: Response) => {
  const foo = await extractArchive({
    name: "Neonomicon 01 (of 04) (2010) (Project Comic Con cover) (Minutemen-DTs).cbz",
    extension: ".cbz",
    containedIn: "comics/Neonomicon",
    isFile: true,
    isLink: false,
  });
  // const foo = await extractMetadataFromImage(
  //   "./comics/covers/Ghosts and Ruins-001.jpg",
  // );
  // const foo = await unzipOne();
  // const foo = await unzip("asd");
  // const foo = explodePath("Chapter Three/HELLBOY - The Chained Coffin - 069.jpg");
  res.json({
    jagan: "trupti",
    foo,
  });
});

router.route("/walkFolder").get(async (req: Request, res: Response) => {
  const basePathToWalk =
    typeof req.query.basePathToWalk === "string"
      ? req.query.basePathToWalk
      : "";
  const results = await walkFolder(basePathToWalk);
  res.json(results);
});

export default router;
