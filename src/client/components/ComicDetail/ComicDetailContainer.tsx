import React, { ReactElement } from "react";
import { useParams } from "react-router";
import { ComicDetail } from "../ComicDetail/ComicDetail";
import { useQuery } from "@tanstack/react-query";
import { LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";
import axios from "axios";

export const ComicDetailContainer = (): ReactElement | null => {
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const {
    data: comicBookDetailData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["comicBookMetadata"],
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookById`,
        method: "POST",
        data: {
          id: comicObjectId,
        },
      }),
  });

  {
    isError && <>Error</>;
  }
  {
    isLoading && <>Loading...</>;
  }
  return (
    comicBookDetailData?.data && <ComicDetail data={comicBookDetailData.data} />
  );
};
