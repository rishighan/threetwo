import router from "../router";
import { Request, Response } from "express";
import axios from "axios";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body === "object" ? req.body : {};
  const importServiceURI = process.env.DOCKER_HOST
    ? `http://${process.env.DOCKER_HOST}:3000/api/import`
    : "http://localhost:3000/api/import";
  await axios.request({
    url: `${importServiceURI}/processAndImportToDB`,
    method: "POST",
    data: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
  });
  res.send({ message: "Scan and import initiated." });
});

export default router;
