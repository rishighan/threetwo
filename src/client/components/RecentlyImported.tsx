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
    {map(comicBookCovers, (cover) => {
      return <Card comicBookCoversMetadata={cover.rawFileDetails} />;
    })}
  </section>
);
