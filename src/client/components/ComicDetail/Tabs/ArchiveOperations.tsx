import React, { ReactElement, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DnD } from "../../DnD";
import { isEmpty } from "lodash";
import Sticky from "react-stickynode";
import SlidingPane from "react-sliding-pane";
import { extractComicArchive } from "../../../actions/fileops.actions";
import { analyzeImage } from "../../../actions/fileops.actions";
import { Canvas } from "../../shared/Canvas";

export const ArchiveOperations = (props): ReactElement => {
  const { data } = props;
  const isComicBookExtractionInProgress = useSelector(
    (state: RootState) => state.fileOps.comicBookExtractionInProgress,
  );
  const extractedComicBookArchive = useSelector(
    (state: RootState) => state.fileOps.extractedComicBookArchive,
  );

  const imageAnalysisResult = useSelector((state: RootState) => {
    return state.fileOps.imageAnalysisResults;
  });

  const dispatch = useDispatch();
  const unpackComicArchive = useCallback(() => {
    dispatch(
      extractComicArchive(data.rawFileDetails.filePath, {
        type: "full",
        purpose: "analysis",
        imageResizeOptions: {
          baseWidth: 275,
        },
      }),
    );
  }, []);

  // sliding panel config
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  // current image
  const [currentImage, setCurrentImage] = useState([]);

  // sliding panel init
  const contentForSlidingPanel = {
    imageAnalysis: {
      content: () => {
        return (
          <div>
            <pre className="is-size-7">{currentImage}</pre>
            {!isEmpty(imageAnalysisResult) ? (
              <pre className="is-size-7 p-2 mt-3">
                <Canvas data={imageAnalysisResult} />
              </pre>
            ) : null}
            <pre className="is-size-7 mt-3">
              {JSON.stringify(imageAnalysisResult.analyzedData, null, 2)}
            </pre>
          </div>
        );
      },
    },
  };

  // sliding panel handlers
  const openImageAnalysisPanel = useCallback((imageFilePath) => {
    setSlidingPanelContentId("imageAnalysis");
    dispatch(analyzeImage(imageFilePath));
    setCurrentImage(imageFilePath);
    setVisible(true);
  }, []);

  return (
    <div key={2}>
      <button
        className={
          isComicBookExtractionInProgress
            ? "button is-loading is-warning"
            : "button is-warning"
        }
        onClick={unpackComicArchive}
      >
        <span className="icon is-small">
          <i className="fa-solid fa-box-open"></i>
        </span>
        <span>Unpack comic archive</span>
      </button>
      <div className="columns">
        <div className="mt-5">
          {!isEmpty(extractedComicBookArchive) ? (
            <DnD
              data={extractedComicBookArchive}
              onClickHandler={openImageAnalysisPanel}
            />
          ) : null}
        </div>
        {!isEmpty(extractedComicBookArchive) ? (
          <div className="column mt-5">
            <Sticky enabled={true} top={70} bottomBoundary={3000}>
              <div className="card">
                <div className="card-content">
                  <span className="has-text-size-4">
                    {extractedComicBookArchive.length} pages
                  </span>
                  <button className="button is-small is-light is-primary is-outlined">
                    <span className="icon is-small">
                      <i className="fa-solid fa-compress"></i>
                    </span>
                    <span>Convert to CBZ</span>
                  </button>
                </div>
              </div>
            </Sticky>
          </div>
        ) : null}
      </div>
      <SlidingPane
        isOpen={visible}
        onRequestClose={() => setVisible(false)}
        title={"Image Analysis"}
        width={"600px"}
      >
        {slidingPanelContentId !== "" &&
          contentForSlidingPanel[slidingPanelContentId].content()}
      </SlidingPane>
    </div>
  );
};

export default ArchiveOperations;
