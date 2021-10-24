import router from "../router";
import { Request, Response } from "express";
import axios, { AxiosPromise } from "axios";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body === "object" ? req.body : {};
  const importServiceURI = process.env.DOCKER_HOST
    ? `http://${process.env.DOCKER_HOST}:3000/api/import`
    : "http://localhost:3000/api/import";

  const axiosArray: AxiosPromise[] = [];
  for (let x = 0; x < req.body.walkedFolders.length; x++) {
    const newPromise = axios({
      method: "POST",
      url: `${importServiceURI}/processAndImportToDB`,
      data: {
        extractionOptions: req.body.extractionOptions,
        walkedFolders: req.body.walkedFolders[x],
      },
    });
    axiosArray.push(newPromise);
  }

  axios
    .all(axiosArray)
    .then(
      axios.spread((...responses) => {
        responses.forEach((res) => console.log("Success"));
        console.log("submitted all axios calls");
      }),
    )
    .catch((error) => {});

  // await axios.request({
  //   url: `${importServiceURI}/processAndImportToDB`,
  //   method: "POST",
  //   data: {
  //     extractionOptions: req.body.extractionOptions,
  //     walkedFolders: req.body.walkedFolders,
  //   },
  // });
  res.send({ message: "Scan and import initiated." });
});

export default router;
