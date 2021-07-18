import express, { Request, Response, Router, Express } from "express";
import bodyParser from "body-parser";
import path, { basename, extname } from "path";

import { buildAsync } from "calibre-opds";
import initMain from "calibre-opds/lib/index";
import { EnumLinkRel, EnumMIME } from "opds-extra/lib/const";
import { async as FastGlob } from "@bluelovers/fast-glob/bluebird";
import { Entry, Feed } from "opds-extra/lib/v1";
import { Link } from "opds-extra/lib/v1/core";
import { isUndefined } from "lodash";

// call express
const app: Express = express(); // define our app using express
const router = Router();

export function opdsRouter() {
  const path_of_books = "/Users/rishi/work/threetwo/src/server/comics";
  console.log(path_of_books);
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
          await FastGlob(["*.cbr", "*.cbz"], {
            cwd: path_of_books,
          }).each((file) => {
            const ext = extname(file);
            const title = basename(file, ext);

            /**
             * make ur download url
             */
            const href = encodeURI(
              `/Users/rishi/work/threetwo/src/server/comics/${file}`,
            );

            /**
             * mime for file
             */
            const type = "application/octet-stream";

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
      console.log(feed);
      res.setHeader("Content-Type", "application/xml");
      return res.end(feed.toXML());
    });
  });

  return router;
}

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(opdsRouter());

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
