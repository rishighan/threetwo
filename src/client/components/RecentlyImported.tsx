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
    {map(comicBookCovers.docs, ({ _id, rawFileDetails }) => {
      return (
        <Card
          key={_id}
          comicBookCoversMetadata={rawFileDetails}
          mongoObjId={_id}
          hasTitle
          isHorizontal={false}
        />
      );
    })}
  </section>
);
