import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import path from "path";

import { Server } from "r2-streamer-js";

const OPDSServer = new Server({
  disableDecryption: false, // deactivates the decryption of encrypted resources (Readium LCP).
  disableOPDS: false, // deactivates the HTTP routes for the OPDS "micro services" (browser, converter)
  disableReaders: false, // deactivates the built-in "readers" for ReadiumWebPubManifest (HTTP static host / route).
  disableRemotePubUrl: false, // deactivates the HTTP route for loading a remote publication.
  maxPrefetchLinks: 5, // Link HTTP header, with rel = prefetch, see server.ts MAX_PREFETCH_LINKS (default = 10)
});

const url = async () => await OPDSServer.start(5643, false);
url().then(async (res) => {
  console.log(res);
  const publicationURLs = OPDSServer.addPublications([
    "http://localhost:3000/comics/Iron Man/Iron Man - V1 193.cbz",
  ]);
  console.log(publicationURLs);
  OPDSServer.publicationsOPDS();

  const publication = await OPDSServer.loadOrGetCachedPublication(
    "http://localhost:3000/comics/Iron Man/Iron Man - V1 193.cbz",
  );
  console.log(publication);
  OPDSServer.publicationsOPDS();
});

// call express
const app: Express = express(); // define our app using express

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 8050; // set our port

// Send index.html on root request
app.use(express.static("dist"));

app.get("/", (req: Request, res: Response) => {
  console.log("sending index.html");
  res.sendFile("/dist/index.html");
});

// REGISTER ROUTES
// all of the routes will be prefixed with /api

app.listen(port);
console.log(`App listening on ${port}`);
