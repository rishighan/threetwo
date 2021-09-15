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
import router from "../router";

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

export default router;
