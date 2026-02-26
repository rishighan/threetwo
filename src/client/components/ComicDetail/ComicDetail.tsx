import React, { useState, ReactElement, useCallback } from "react";
import { useParams } from "react-router-dom";
import Card from "../shared/Carda";
import { RawFileDetails } from "./RawFileDetails";
import TabControls from "./TabControls";
import { Menu } from "./ActionMenu/Menu";
import { isEmpty, isUndefined, isNil, filter } from "lodash";
import { components } from "react-select";
import "react-sliding-pane/dist/react-sliding-pane.css";
import SlidingPane from "react-sliding-pane";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import { styled } from "styled-components";

// Extracted modules
import { useComicVineMatching } from "./useComicVineMatching";
import { createTabConfig } from "./tabConfig";
import { actionOptions, customStyles, ActionOption } from "./actionMenuConfig";
import { CVMatchesPanel, EditMetadataPanelWrapper } from "./SlidingPanelContent";

// Styled component - moved outside to prevent recreation
const StyledSlidingPanel = styled(SlidingPane)`
  background: #ccc;
`;

interface RawFileDetails {
  name: string;
  cover?: {
    filePath?: string;
  };
  containedIn?: string;
  fileSize?: number;
  path?: string;
  extension?: string;
  mimeType?: string;
  [key: string]: any;
}

interface InferredIssue {
  name?: string;
  number?: number;
  year?: string;
  subtitle?: string;
  [key: string]: any;
}

interface ComicVineMetadata {
  name?: string;
  volumeInformation?: any;
  [key: string]: any;
}

interface Acquisition {
  directconnect?: {
    downloads?: any[];
  };
  torrent?: any[];
  [key: string]: any;
}

interface ComicDetailProps {
  data: {
    _id: string;
    rawFileDetails?: RawFileDetails;
    inferredMetadata: {
      issue?: InferredIssue;
    };
    sourcedMetadata: {
      comicvine?: ComicVineMetadata;
      locg?: any;
      comicInfo?: any;
    };
    acquisition?: Acquisition;
    createdAt: string;
    updatedAt: string;
  };
  userSettings?: any;
  queryClient?: any;
  comicObjectId?: string;
}

/**
 * Component for displaying the metadata for a comic in greater detail.
 *
 * @component
 * @example
 * return (
 *   <ComicDetail/>
 * )
 */
export const ComicDetail = (data: ComicDetailProps): ReactElement => {
  const {
    data: {
      _id,
      rawFileDetails,
      inferredMetadata,
      sourcedMetadata: { comicvine, locg, comicInfo },
      acquisition,
      createdAt,
      updatedAt,
    },
    userSettings,
    queryClient,
    comicObjectId: comicObjectIdProp,
  } = data;

  const [activeTab, setActiveTab] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);

  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const { comicVineMatches, prepareAndFetchMatches } = useComicVineMatching();

  // Modal handlers (currently unused but kept for future use)
  const openModal = useCallback((filePath: string) => {
    setIsOpen(true);
  }, []);

  const afterOpenModal = useCallback((things: any) => {
    console.log("kolaveri", things);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Action event handlers
  const openDrawerWithCVMatches = () => {
    prepareAndFetchMatches(rawFileDetails, comicvine);
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  };

  const openEditMetadataPanel = useCallback(() => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);

  // Action menu handler
  const Placeholder = components.Placeholder;
  const filteredActionOptions = filter(actionOptions, (item) => {
    if (isUndefined(rawFileDetails)) {
      return item.value !== "match-on-comic-vine";
    }
    return item;
  });

  const handleActionSelection = (action: ActionOption) => {
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
        break;
      case "edit-metdata":
        openEditMetadataPanel();
        break;
      default:
        console.log("No valid action selected.");
        break;
    }
  };

  // Check for metadata availability
  const isComicBookMetadataAvailable =
    !isUndefined(comicvine) && !isUndefined(comicvine?.volumeInformation);

  const areRawFileDetailsAvailable =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails);

  const { issueName, url } = determineCoverFile({
    rawFileDetails,
    comicvine,
    locg,
  });

  // Query for airdc++
  const airDCPPQuery = {
    issue: {
      name: issueName,
    },
  };

  // Create tab configuration
  const tabGroup = createTabConfig({
    data: data.data,
    comicInfo,
    isComicBookMetadataAvailable,
    areRawFileDetailsAvailable,
    airDCPPQuery,
    comicObjectId: _id,
    userSettings,
    issueName,
    acquisition,
  });

  const filteredTabs = tabGroup.filter((tab) => tab.shouldShow);

  // Sliding panel content mapping
  const renderSlidingPanelContent = () => {
    switch (slidingPanelContentId) {
      case "CVMatches":
        return (
          <CVMatchesPanel
            rawFileDetails={rawFileDetails}
            inferredMetadata={inferredMetadata}
            comicVineMatches={comicVineMatches}
            comicObjectId={comicObjectId || _id}
            queryClient={queryClient}
            onMatchApplied={() => {
              setVisible(false);
              setActiveTab(1);
            }}
          />
        );
      case "editComicBookMetadata":
        return <EditMetadataPanelWrapper rawFileDetails={rawFileDetails} />;
      default:
        return null;
    }
  };

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="section">
        {!isNil(data) && !isEmpty(data) && (
          <>
            <div>
              <div className="flex flex-row mt-5">
                <Card
                  imageUrl={url}
                  orientation={"cover-only"}
                  hasDetails={false}
                />

                {/* raw file details */}
                {!isUndefined(rawFileDetails) &&
                  !isEmpty(rawFileDetails?.cover) && (
                    <div className="grid">
                      <RawFileDetails
                        data={{
                          rawFileDetails: rawFileDetails,
                          inferredMetadata: inferredMetadata,
                          created_at: createdAt,
                          updated_at: updatedAt,
                        }}
                      >
                        {/* action dropdown */}
                        <div className="mt-1 flex flex-row gap-2 w-full">
                          <Menu
                            data={data.data}
                            handlers={{ setSlidingPanelContentId, setVisible }}
                            configuration={{
                              filteredActionOptions,
                              customStyles,
                              handleActionSelection,
                              Placeholder,
                            }}
                          />
                        </div>
                      </RawFileDetails>
                    </div>
                  )}
              </div>
            </div>

            <TabControls
              filteredTabs={filteredTabs}
              downloadCount={acquisition?.directconnect?.downloads?.length || 0}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <StyledSlidingPanel
              isOpen={visible}
              onRequestClose={() => setVisible(false)}
              title={"Comic Vine Search Matches"}
              width={"600px"}
            >
              {renderSlidingPanelContent()}
            </StyledSlidingPanel>
          </>
        )}
      </div>
    </section>
  );
};

export default ComicDetail;
