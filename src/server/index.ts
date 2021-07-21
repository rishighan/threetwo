import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import { basename, extname, join } from "path";
import { lookup } from "mime-types";
import { promises as fs } from "fs";
import { responseStream } from "http-response-stream";
import { isUndefined } from "lodash";
import { buildAsync } from "calibre-opds";
import initMain from "calibre-opds/lib/index";
import { EnumLinkRel } from "opds-extra/lib/const";
import { async as FastGlob } from "@bluelovers/fast-glob/bluebird";
import { Entry, Feed } from "opds-extra/lib/v1";
import { Link } from "opds-extra/lib/v1/core";
import SocketService from "./utils/airdcpp.socket.service";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// call express
const app: Express = express(); // define our app using express
const router = Router();

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 8050; // set our port

// Send index.html on root request
app.use(express.static("dist"));

export function opdsRouter() {
  const path_of_books = "/Users/rishi/work/threetwo/src/server/comics";
  router.use("/opds", async (req, res, next) => {
    return buildAsync(
      initMain({
        title: `title`,
        subtitle: `subtitle`,
        icon: "/favicon.ico",
      }),
      [
        async (feed: Feed) => {
          feed.books = feed.books || [];
          await FastGlob(["*.cbr", "*.cbz", "*.cb7", "*.cba", "*.cbt"], {
            cwd: path_of_books,
          }).each((file) => {
            const ext = extname(file);
            const title = basename(file, ext);

            const href = encodeURI(`/file/${file}`);

            const type = lookup(ext) || "application/octet-stream";

            const entry = Entry.deserialize<Entry>({
              title,
              links: [
                {
                  rel: EnumLinkRel.ACQUISITION,
                  href,
                  type,
                } as Link,
              ],
            });

            if (!isUndefined(feed) && !isUndefined(feed.books)) {
              console.log("haramzada", feed.books);
              feed.books.push(entry);
            }
          });

          return feed;
        },
      ],
    ).then((feed) => {
      res.setHeader("Content-Type", "application/xml");
      return res.end(feed.toXML());
    });
  });

  router.use("/file/*", async (req, res) => {
    const file: string = req.params[0];
    const ext = extname(file);

    if ([".cbr", ".cbz", ".cb7", ".cba", ".cbt"].includes(ext)) {
      const content = await fs.readFile(join(path_of_books, file));
      const mime = lookup(ext) || "application/octet-stream";
      res.set("Content-Type", mime);
      return responseStream(res, content);
    }

    res.status(404).end(`'${file}' not exists`);
  });

  return router;
}
app.get("/", (req: Request, res: Response) => {
  console.log("sending index.html");
  res.sendFile("/dist/index.html");
});
interface SearchInstance {
  current_search_id: string;
  expires_in: number;
  id: number;
  owner: string;
  query: Record<string, unknown>;
  queue_time: number;
  queued_count: number;
  result_count: number;
  searches_sent_ago: number;
}
app.use(opdsRouter());
const foo = SocketService.connect("admin", "password");
foo.then(async (data) => {
  const instance: SearchInstance = await SocketService.post("search");
  await sleep(10000);

  const searchInfo = await SocketService.post(
    `search/${instance.id}/hub_search`,
    {
      query: {
        pattern: "H.P. Lovecraft",
        file_type: "compressed",
        extensions: ["cbz", "cbr"],
      },
      hub_urls: [
        "nmdcs://piter.feardc.net:411",
        "dchub://dc.rutrack.net",
        "dchub://dc.elitedc.ru",
      ],
      priority: 1,
    },
  );
  await sleep(10000);
  const results = await SocketService.get(`search/${instance.id}/results/0/5`);
  console.log(results);
});

// REGISTER ROUTES
// all of the routes will be prefixed with /api

app.listen(port);
console.log(`App listening on ${port}`);
