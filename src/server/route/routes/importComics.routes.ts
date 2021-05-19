import router from "../router";
import { Request, Response } from "express";
import axios from "axios";
import stream from "stream";
import through2 from "through2";
import hyperquest from "hyperquest";
import request from "request";
import es from "event-stream";
import JSONStream from "JSONStream";
import oboe from "oboe";
import { io } from "socket.io-client";

const socket = io("ws://localhost:3000/", {
  reconnectionDelayMax: 10000,
});

socket.on("connect", () => {
  console.log(`connect ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log(`disconnect`);
});

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body.extractionOptions === "object"
    ? req.body.extractionOptions
    : {};
  const { extractionOptions, walkedFolders } = req.body;
  socket.emit("call", {
    action: "getComicCovers",
    params: {
      extractionOptions,
      walkedFolders,
    },
    opts: { garam: "pasha" },
  });
  socket.on("comicBookCoverMetadata", (done) => {
    console.log(done);
  });
  // socket.on("hello", (done) => done);
  res.sendStatus(200);
});

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
