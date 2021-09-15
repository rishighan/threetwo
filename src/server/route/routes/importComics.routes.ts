import router from "../router";
import { Request, Response } from "express";
const amqp = require("amqplib/callback_api");
import axios from "axios";
import { io } from "../../index";

router.route("/getComicCovers").post(async (req: Request, res: Response) => {
  typeof req.body === "object" ? req.body : {};
  await axios.request({
    url: "http://localhost:3000/api/import/importComicsToDB",
    method: "POST",
    data: {
      extractionOptions: req.body.extractionOptions,
      walkedFolders: req.body.walkedFolders,
    },
  });
  const queueConsumer = amqp.connect(
    "amqp://localhost",
    (error0, connection) => {
      if (error0) {
        throw error0;
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }
        const queue = "comicBookCovers";
        channel.assertQueue(queue, {
          durable: false,
        });

        console.log(`Connected to ${queue}`);
        console.log(`Waiting for comic book cover data in ${queue}`);

        channel.consume(
          queue,
          (data) => {
            //Socket Trigger All Clients
            io.sockets.emit(
              "coverExtracted",
              JSON.parse(data.content.toString()),
            );
          },
          {
            noAck: true,
          },
        );
      });
    },
  );
  res.send({ queue: queueConsumer });
});

export default router;
