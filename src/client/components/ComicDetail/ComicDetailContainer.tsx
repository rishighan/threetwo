import { isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getComicBookDetailById } from "../../actions/comicinfo.actions";
import { ComicDetail } from "../ComicDetail/ComicDetail";

import { getSettings } from "../../actions/settings.actions";
import { AirDCPPSocketContext } from "../../context/AirDCPPSocket";
import AirDCPPSocket from "../../services/DcppSearchService";


export const ComicDetailContainer = (): ReactElement | null => {
  const comicBookDetailData = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  const userSettings = useSelector((state: RootState) => state.settings.data);
  const { ADCPPSocket, setADCPPSocket } = useContext(AirDCPPSocketContext);

  useEffect(() => {
    if (isEmpty(ADCPPSocket) && !isNil(userSettings.directConnect)) {
      setADCPPSocket(
        new AirDCPPSocket({
          protocol: `${userSettings.directConnect.client.host.protocol}`,
          hostname: `${userSettings.directConnect.client.host.hostname}`,
        }),
      );
    }
  }, [userSettings]);
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  useEffect(() => {
    dispatch(getComicBookDetailById(comicObjectId));
    // dispatch(getSettings());
  }, [dispatch]);
  return !isEmpty(comicBookDetailData) ? (
    <ComicDetail data={comicBookDetailData} userSettings={userSettings} />
  ) : null;
};
