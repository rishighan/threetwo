import React from "react";
import Card from "./Card";
import { map } from "lodash";

type RecentlyImportedProps = {
  comicBookCovers: any;
};

export const RecentlyImported = ({
  comicBookCovers,
}: RecentlyImportedProps) => (
  <section className="card-container">
    {map(comicBookCovers.docs, (doc, idx) => {
      return (
        <Card
          key={idx}
          comicBookCoversMetadata={doc.rawFileDetails}
          mongoObjId={doc._id}
          title
        />
      );
    })}
  </section>
);
