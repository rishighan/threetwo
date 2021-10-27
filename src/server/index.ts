import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import router from "./route";

// call express
const app: Express = express(); // define our app using express

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 8050; // set our port

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

console.log(`Server is listening on ${port}`);
