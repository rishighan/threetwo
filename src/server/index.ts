import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import router from "./route";
import path from "path";

// call express
const app: Express = express(); // define our app using express

const port: number = Number(process.env.PORT) || 8050; // set our port

// Configure app to respond with these headers for CORS purposes
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//
// app.get("/", (req: Request, res: Response) => {
//   console.log("sending index.html");
//   res.sendFile(path.resolve(__dirname, "../dist/index.html"));
// });

// REGISTER ROUTES
// all of the routes will be prefixed with /api
// const routes: Router[] = Object.values(router);
// app.use("/api", routes);

// Send index.html on root request
app.use(express.static("dist"));
app.use(express.static("public"));

app.listen(port);

console.log(`Server is listening on ${port}`);
