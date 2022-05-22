import { isEmpty, isUndefined } from "lodash";
import React, { ReactElement, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getComicBookDetailById } from "../../actions/comicinfo.actions";
import { ComicDetail } from "../ComicDetail/ComicDetail";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";

import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { getSettings } from "../../actions/settings.actions";


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
