import { isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getComicBookDetailById } from "../../actions/comicinfo.actions";
import { ComicDetail } from "../ComicDetail/ComicDetail";

export const ComicDetailContainer = (): ReactElement | null => {
  // const comicBookDetailData = useSelector(
  //   (state: RootState) => state.comicInfo.comicBookDetail,
  // );

  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  console.log(comicObjectId);
  useEffect(() => {
    // dispatch(getComicBookDetailById(comicObjectId));
    // dispatch(getSettings());
  }, []);
  return <ComicDetail data={comicBookDetailData} />;
};
