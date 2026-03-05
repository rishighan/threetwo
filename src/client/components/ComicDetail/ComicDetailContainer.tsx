import React, { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { ComicDetail } from "../ComicDetail/ComicDetail";
import { useQueryClient } from "@tanstack/react-query";
import { useGetComicByIdQuery } from "../../graphql/generated";
import { adaptGraphQLComicToLegacy } from "../../graphql/adapters/comicAdapter";

export const ComicDetailContainer = (): ReactElement | null => {
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const queryClient = useQueryClient();
  
  const {
    data: comicBookDetailData,
    isLoading,
    isError,
  } = useGetComicByIdQuery(
    { id: comicObjectId! },
    { enabled: !!comicObjectId }
  );

  if (isError) {
    return <div>Error loading comic details</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const adaptedData = comicBookDetailData?.comic 
    ? adaptGraphQLComicToLegacy(comicBookDetailData.comic)
    : null;

  return adaptedData ? (
    <ComicDetail
      data={adaptedData}
      queryClient={queryClient}
      comicObjectId={comicObjectId}
    />
  ) : null;
};
