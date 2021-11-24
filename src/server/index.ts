import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import router from "./route";
import path from "path";
import cors_proxy from "cors-anywhere";

// call express
const app: Express = express(); // define our app using express
const host = process.env.HOST || "0.0.0.0";

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 8050; // set our port
const proxyPort = 8050; // set our port

app.get("/", (req: Request, res: Response) => {
  console.log("sending index.html");
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

// REGISTER ROUTES
// all of the routes will be prefixed with /api
const routes: Router[] = Object.values(router);
app.use("/api", routes);

// Send index.html on root request
app.use(express.static("dist"));
app.use(express.static("public"));

// app.listen(port);
// console.log(`Server is listening on ${port}`);

cors_proxy
  .createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ["origin", "x-requested-with"],
    removeHeaders: ["cookie", "cookie2"],
  })
  .listen(port, host, function () {
    console.log(
      "ThreeTwo! Express server with CORS Anywhere running on " +
        host +
        ":" +
        proxyPort,
    );
  });
