import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./route";
const amqp = require("amqplib/callback_api");

// call express
const app: Express = express(); // define our app using express

const httpServer = createServer();
export const io = new Server(httpServer, {});

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 8050; // set our port
// set rabbitMQ host

const rabbitMQConnectionString = rabbitMQDockerConnectionString || "localhost";

// Send index.html on root request
app.use(express.static("dist"));
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  console.log("sending index.html");
  res.sendFile("/dist/index.html");
});

// REGISTER ROUTES
// all of the routes will be prefixed with /api
const routes: Router[] = Object.values(router);
app.use("/api", routes);

app.listen(port);

io.on("connection", (socket) => {
  console.log("Socket connected");

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

amqp.connect(`amqp://${rabbitMQConnectionString}`, (error0, connection) => {
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
        io.sockets.emit("coverExtracted", JSON.parse(data.content.toString()));
      },
      {
        noAck: true,
      },
    );
  });
});

// socket server
httpServer.listen(8051);
console.log(`Socket server is listening on 8051`);
console.log(`Server is listening on ${port}`);
