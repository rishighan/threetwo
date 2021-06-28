import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import { isEmpty, isUndefined } from "lodash";
import { IExtractedComicBookCoverFile } from "threetwo-ui-typings";
import { fetchComicVineMatches } from "../actions/fileops.actions";
import { Drawer } from "antd";
import "antd/dist/antd.css";

type ComicDetailProps = {};

export const ComicDetail = ({}: ComicDetailProps) => {
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [comicDetail, setComicDetail] = useState<{
    rawFileDetails: IExtractedComicBookCoverFile;
  }>();
  const { comicObjectId } = useParams<{ comicObjectId: string }>();

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };
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
          <div className="columns">
            <div className="column is-narrow">
              <Card comicBookCoversMetadata={comicDetail.rawFileDetails} />
            </div>
            <div className="column">
              <button className="button" onClick={showDrawer}>
                <span className="icon">
                  <i className="fas fa-magic"></i>
                </span>
                <span>Match on Comic Vine</span>
              </button>
            </div>
          </div>

          <Drawer
            title="ComicVine Search Results"
            placement="right"
            width={640}
            closable={false}
            onClose={onClose}
            visible={visible}
          >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Drawer>
        </>
      )}
    </section>
  );
};
