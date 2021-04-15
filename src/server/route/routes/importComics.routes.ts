import router from "../router";
import { walkFolder, extractArchive } from "../../utils/fs.utils";
import { Request, Response } from "express";

router.route("/getComicCovers").get((req: Request, res: Response) => {
  res.json({
    jagan: "trupti",
  });
});

router.route("/walkFolder").get(async (req: Request, res: Response) => {
  const results = await walkFolder(req.params.basePathToWalk);
  res.json(results);
});

export default router;
