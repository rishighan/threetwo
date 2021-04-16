import router from "../router";
import { walkFolder, extractArchive } from "../../utils/fs.utils";
import { Request, Response } from "express";

router.route("/getComicCovers").get((req: Request, res: Response) => {
  res.json({
    jagan: "trupti",
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
