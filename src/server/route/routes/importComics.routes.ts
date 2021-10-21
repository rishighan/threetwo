import router from "../router";
import { Request, Response } from "express";
import axios from "axios";
import { IMPORT_SERVICE_BASE_URI } from "../../../client/constants/endpoints";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body === "object" ? req.body : {};
  await axios.request({
    url: `${IMPORT_SERVICE_BASE_URI}/processAndImportToDB`,
    method: "POST",
    data: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
  });
  res.send({ message: "Scan and import initiated." });
});

export default router;
