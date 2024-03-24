import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { DnD } from "../../shared/Draggable/DnD";
import { isEmpty } from "lodash";
import SlidingPane from "react-sliding-pane";
import { Canvas } from "../../shared/Canvas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  IMAGETRANSFORMATION_SERVICE_BASE_URI,
  LIBRARY_SERVICE_BASE_URI,
  LIBRARY_SERVICE_HOST,
} from "../../../constants/endpoints";
import { useStore } from "../../../store";
import { useShallow } from "zustand/react/shallow";
import { escapePoundSymbol } from "../../../shared/utils/formatting.utils";

export const ArchiveOperations = (props): ReactElement => {
  const { data } = props;

  const { socketIOInstance } = useStore(
    useShallow((state) => ({
      socketIOInstance: state.socketIOInstance,
    })),
  );
  const queryClient = useQueryClient();
  // sliding panel config
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  // current image
  const [currentImage, setCurrentImage] = useState([]);
  const [uncompressedArchive, setUncompressedArchive] = useState([]);
  const [imageAnalysisResult, setImageAnalysisResult] = useState({});
  const [shouldRefetchComicBookData, setShouldRefetchComicBookData] =
    useState(false);
  const constructImagePaths = (data): Array<string> => {
    return data?.map((path: string) =>
      escapePoundSymbol(encodeURI(`${LIBRARY_SERVICE_HOST}/${path}`)),
    );
  };

  // Listen to the uncompression complete event and orchestrate the final payload
  socketIOInstance.on("LS_UNCOMPRESSION_JOB_COMPLETE", (data) => {
    setUncompressedArchive(constructImagePaths(data?.uncompressedArchive));
  });

  useEffect(() => {
    let isMounted = true;

    if (data.rawFileDetails?.archive?.uncompressed) {
      const fetchUncompressedArchive = async () => {
        try {
          const response = await axios({
            url: `${LIBRARY_SERVICE_BASE_URI}/walkFolders`,
            method: "POST",
            data: {
              basePathToWalk: data?.rawFileDetails?.archive?.expandedPath,
              extensions: [".jpg", ".jpeg", ".png", ".bmp", "gif"],
            },
            transformResponse: async (responseData) => {
              const parsedData = JSON.parse(responseData);
              const paths = parsedData.map((pathObject) => {
                return `${pathObject.containedIn}/${pathObject.name}${pathObject.extension}`;
              });
              const uncompressedArchive = constructImagePaths(paths);

              if (isMounted) {
                setUncompressedArchive(uncompressedArchive);
                setShouldRefetchComicBookData(true);
              }
            },
          });
        } catch (error) {
          console.error("Error fetching uncompressed archive:", error);
          // Handle error if necessary
        }
      };
      fetchUncompressedArchive();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      setUncompressedArchive([]);
    };
  }, [data]);

  const analyzeImage = async (imageFilePath: string) => {
    const response = await axios({
      url: `${IMAGETRANSFORMATION_SERVICE_BASE_URI}/analyze`,
      method: "POST",
      data: {
        imageFilePath,
      },
    });
    setImageAnalysisResult(response?.data);
    queryClient.invalidateQueries({ queryKey: ["uncompressedArchive"] });
  };

  const {
    data: uncompressionResult,
    refetch,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: async () =>
      await axios({
        method: "POST",
        url: `http://localhost:3000/api/library/uncompressFullArchive`,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          filePath: data.rawFileDetails.filePath,
          comicObjectId: data._id,
          options: {
            type: "full",
            purpose: "analysis",
            imageResizeOptions: {
              baseWidth: 275,
            },
          },
        },
      }),
    queryKey: ["uncompressedArchive"],
    enabled: false,
  });

  if (isSuccess && shouldRefetchComicBookData) {
    queryClient.invalidateQueries({ queryKey: ["comicBookMetadata"] });
    setShouldRefetchComicBookData(false);
  }

  // sliding panel init
  const contentForSlidingPanel = {
    imageAnalysis: {
      content: () => {
        return (
          <div>
            <pre className="text-sm">{currentImage}</pre>
            {!isEmpty(imageAnalysisResult) ? (
              <pre className="p-2 mt-3">
                <Canvas data={imageAnalysisResult} />
              </pre>
            ) : null}
            <pre className="font-hasklig mt-3 text-sm">
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
    analyzeImage(imageFilePath);
    setCurrentImage(imageFilePath);
    setVisible(true);
  }, []);

  return (
    <div key={2}>
      <article
        role="alert"
        className="mt-4 text-md rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
      >
        <div>
          <p>You can perform several operations on your comic book archive.</p>
          <p>
            Uncompressing, re-organizing the individual pages, then
            re-compressing to a different format, for example.
          </p>
          <p>You can also analyze color histograms of pages.</p>
        </div>
      </article>
      <div className="mt-5">
        {data.rawFileDetails.archive?.uncompressed &&
        !isEmpty(uncompressedArchive) ? (
          <article
            role="alert"
            className="mt-4 text-md rounded-lg max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600"
          >
            This issue is already uncompressed at:
            <p>
              <code className="font-hasklig text-sm">
                {data.rawFileDetails.archive.expandedPath}
              </code>
              <div className="">It has {uncompressedArchive?.length} pages</div>
            </p>
          </article>
        ) : null}

        <div className="flex flex-row gap-2 mt-4">
          {isEmpty(uncompressedArchive) ? (
            <button
              className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-2 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
              onClick={() => refetch()}
            >
              <span className="text-md">Unpack Comic Archive</span>
              <span className="w-6 h-6">
                <i className="h-6 w-6 icon-[solar--box-bold-duotone]"></i>
              </span>
            </button>
          ) : null}

          {!isEmpty(uncompressedArchive) ? (
            <div>
              <button
                className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-2 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                onClick={() => refetch()}
              >
                <span className="text-md">Convert to .cbz</span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--zip-file-bold-duotone]"></i>
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mt-10">
          {!isEmpty(uncompressedArchive) ? (
            <DnD
              data={uncompressedArchive}
              onClickHandler={openImageAnalysisPanel}
            />
          ) : null}
        </div>
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
