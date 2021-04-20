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
    name: "Hellboy - The Chained Coffin and Others Ch3.cbr",
    extension: ".cbr",
    containedIn: "comics/Hellboy. The Chained Coffin and Others (1998) (of 1)",
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
