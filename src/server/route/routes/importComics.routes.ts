import router from "../router";
import {
  walkFolder,
  extractArchive,
  unrar,
  unzip,
  extractMetadataFromImage,
} from "../../utils/fs.utils";
import { Request, Response } from "express";

router.route("/getComicCovers").get(async (req: Request, res: Response) => {
  // const foo = await unrar("./comics/covers/");
  // const foo = await extractMetadataFromImage(
  //   "./comics/covers/Ghosts and Ruins-001.jpg",
  // );
  const foo = await unzip("st");
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
