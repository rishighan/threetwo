import router from "../router";
import { Request, Response } from "express";
import axios from "axios";

router.route("/walkFolder").post(async (req: Request, res: Response) => {
  const basePathToWalk =
    typeof req.body.basePathToWalk === "string" ? req.body.basePathToWalk : "";
  const walkedFolders = await axios
    .request({
      url: "http://localhost:3000/api/import/walkFolders",
      method: "POST",
      data: {
        basePathToWalk,
      },
    })
    .then((data) => data.data)
    .catch((error) => error);
  return res.json(walkedFolders);
});

export default router;
