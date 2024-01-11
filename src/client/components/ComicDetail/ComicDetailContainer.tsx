import { isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getComicBookDetailById } from "../../actions/comicinfo.actions";
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

  console.log(comicBookDetailData);
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
