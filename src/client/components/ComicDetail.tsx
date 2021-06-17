import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import { isEmpty, isUndefined } from "lodash";
import { IExtractedComicBookCoverFile } from "threetwo-ui-typings";
type ComicDetailProps = {};

export const ComicDetail = ({}: ComicDetailProps) => {
  const [page, setPage] = useState(1);
  const [comicDetail, setComicDetail] = useState<{
    rawFileDetails: IExtractedComicBookCoverFile;
  }>();
  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  useEffect(() => {
    axios
      .request({
        url: `http://localhost:3000/api/import/getComicBookById`,

        method: "POST",
        data: {
          id: comicObjectId,
        },
      })
      .then((response) => {
        console.log("fetched", response);
        setComicDetail(response.data);
      })
      .catch((error) => console.log(error));
  }, [page]);

  return (
    <section className="container">
      {!isEmpty(comicDetail) && !isUndefined(comicDetail) && (
        <>
          <h1 className="title">{comicDetail.rawFileDetails.name}</h1>
          <Card comicBookCoversMetadata={comicDetail.rawFileDetails} />
        </>
      )}
    </section>
  );
};
