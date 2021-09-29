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
import xml2js from "xml2js";

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
        feed.id = "urn:uuid:2853dacf-ed79-42f5-8e8a-a7bb3d1ae6a2";
        feed.books = feed.books || [];
        await FastGlob(["*.cbr", "*.cbz", "*.cb7", "*.cba", "*.cbt"], {
          cwd: path_of_books,
        }).each((file, idx) => {
          const ext = extname(file);
          const title = basename(file, ext);
          const href = encodeURI(`/api/file/${file}`);
          const type = lookup(ext) || "application/octet-stream";

          const entry = Entry.deserialize<Entry>({
            title,
            id: idx,
            links: [
              {
                rel: EnumLinkRel.ACQUISITION,
                href,
                type,
              } as Link,
            ],
          });

          if (!isUndefined(feed) && !isUndefined(feed.books)) {
            feed.books.push(entry);
          }
        });

        return feed;
      },
    ],
  ).then((feed) => {
    res.setHeader("Content-Type", "application/xml");
    let data;
    xml2js.parseString(feed.toXML(), (err, result) => {
      result.feed.link = {
        $: {
          rel: "self",
          href: "/opds-catalogs/root.xml",
          type: "application/atom+xml;profile=opds-catalog;kind=navigation",
        },
        _: "",
      };
      const builder = new xml2js.Builder({
        xmldec: {
          version: "1.0",
          encoding: "UTF-8",
          standalone: false,
        },
      });
      data = builder.buildObject(result, {
        renderOpts: {
          pretty: true,
          indent: " ",
          newline: "\n",
          allowEmpty: true,
        },
      });
    });
    return res.end(data);
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
