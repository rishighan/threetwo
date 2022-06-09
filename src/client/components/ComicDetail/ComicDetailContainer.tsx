import { isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getComicBookDetailById } from "../../actions/comicinfo.actions";
import { ComicDetail } from "../ComicDetail/ComicDetail";

export const ComicDetailContainer = (): ReactElement | null => {
  const comicBookDetailData = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const dispatch = useDispatch();

  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  useEffect(() => {
    dispatch(getComicBookDetailById(comicObjectId));
    // dispatch(getSettings());
  }, [dispatch]);
  return !isEmpty(comicBookDetailData) ? (
    <ComicDetail data={comicBookDetailData} />
  ) : null;
};
