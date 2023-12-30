import React, { ReactElement, useCallback, useState } from "react";
import { DnD } from "../../shared/Draggable/DnD";
import { isEmpty } from "lodash";
import Sticky from "react-stickynode";
import SlidingPane from "react-sliding-pane";
import { analyzeImage } from "../../../actions/fileops.actions";
import { Canvas } from "../../shared/Canvas";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LIBRARY_SERVICE_BASE_URI } from "../../../constants/endpoints";

export const ArchiveOperations = (props): ReactElement => {
  const { data } = props;
  //   const isComicBookExtractionInProgress = useSelector(
  //     (state: RootState) => state.fileOps.comicBookExtractionInProgress,
  //   );
  //   const extractedComicBookArchive = useSelector(
  //     (state: RootState) => state.fileOps.extractedComicBookArchive.analysis,
  //   );
  //
  //   const imageAnalysisResult = useSelector((state: RootState) => {
  //     return state.fileOps.imageAnalysisResults;
  //   });

  // sliding panel config
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  // current image
  const [currentImage, setCurrentImage] = useState([]);

  const {
    data: uncompressedArchive,
    refetch,
    isLoading,
  } = useQuery({
    queryFn: async () =>
      await axios({
        method: "POST",
        url: `${LIBRARY_SERVICE_BASE_URI}/uncompressFullArchive`,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          filePath: data.rawFileDetails.filePath,
          options: {
            type: "full",
            purpose: "analysis",
            imageResizeOptions: {
              baseWidth: 275,
            },
          },
        },
      }),
    queryKey: [""],
    enabled: false,
  });
  console.log(uncompressedArchive);
  // sliding panel init
  const contentForSlidingPanel = {
    // imageAnalysis: {
    //   content: () => {
    //     return (
    //       <div>
    //         <pre className="is-size-7">{currentImage}</pre>
    //         {!isEmpty(imageAnalysisResult) ? (
    //           <pre className="is-size-7 p-2 mt-3">
    //             <Canvas data={imageAnalysisResult} />
    //           </pre>
    //         ) : null}
    //         <pre className="is-size-7 mt-3">
    //           {JSON.stringify(imageAnalysisResult.analyzedData, null, 2)}
    //         </pre>
    //       </div>
    //     );
    //   },
    // },
  };

  // sliding panel handlers
  const openImageAnalysisPanel = useCallback((imageFilePath) => {
    setSlidingPanelContentId("imageAnalysis");
    // dispatch(analyzeImage(imageFilePath));
    setCurrentImage(imageFilePath);
    setVisible(true);
  }, []);

  return (
    <div key={2}>
      <button
        className={
          isLoading ? "button is-loading is-warning" : "button is-warning"
        }
        onClick={() => refetch()}
      >
        <span className="icon is-small">
          <i className="fa-solid fa-box-open"></i>
        </span>
        <span>Unpack comic archive</span>
      </button>
      <div className="columns">
        <div className="mt-5">
          {!isEmpty(uncompressedArchive) ? (
            <DnD
              data={uncompressedArchive}
              onClickHandler={openImageAnalysisPanel}
            />
          ) : null}
        </div>
        {!isEmpty(uncompressedArchive) ? (
          <div>
            <span className="has-text-size-4">
              {uncompressedArchive?.length} pages
            </span>
            <button className="button is-small is-light is-primary is-outlined">
              <span className="icon is-small">
                <i className="fa-solid fa-compress"></i>
              </span>
              <span>Convert to CBZ</span>
            </button>
          </div>
        ) : null}
      </div>
      {/* <SlidingPane
        isOpen={visible}
        onRequestClose={() => setVisible(false)}
        title={"Image Analysis"}
        width={"600px"}
      >
        {slidingPanelContentId !== "" &&
          contentForSlidingPanel[slidingPanelContentId].content()}
      </SlidingPane> */}
    </div>
  );
};

export default ArchiveOperations;
