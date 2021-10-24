import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import { createServer } from "http";

import router from "./route";
import cors from "cors";
const amqp = require("amqplib/callback_api");

// call express
const app: Express = express(); // define our app using express
app.use(cors({ origin: "*" }));

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 8050; // set our port
// set rabbitMQ host

const rabbitMQConnectionString =
  process.env.RABBITMQ_URI || "amqp://localhost:5672";

app.get("/", (req: Request, res: Response) => {
  console.log("sending index.html");
  res.sendFile("/dist/index.html");
});

// REGISTER ROUTES
// all of the routes will be prefixed with /api
const routes: Router[] = Object.values(router);
app.use("/api", routes);

// Send index.html on root request
app.use(express.static("dist"));
app.use(express.static("public"));

app.listen(port);

amqp.connect(`${rabbitMQConnectionString}`, (error0, connection) => {
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

    console.log(`RabbitMQ: Connected to ${queue} queue.`);
    console.log(`RabbitMQ: Waiting for comic book cover data in ${queue}`);

    channel.consume(
      queue,
      (data) => {
        //Socket Trigger All Clients
        // io.sockets.emit("coverExtracted", JSON.parse(data.content.toString()));
      },
      {
        noAck: true,
      },
    );
  });
});

console.log(`Server is listening on ${port}`);
