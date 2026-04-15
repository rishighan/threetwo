import React, { useState, ReactElement, useCallback, useMemo } from "react";
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
import type { ComicDetailProps } from "../../types";

// Extracted modules
import { useComicVineMatching } from "./useComicVineMatching";
import { createTabConfig } from "./tabConfig";
import { actionOptions, customStyles, ActionOption } from "./actionMenuConfig";
import { CVMatchesPanel, EditMetadataPanelWrapper } from "./SlidingPanelContent";

// Styled component - moved outside to prevent recreation
const StyledSlidingPanel = styled(SlidingPane)`
  background: #ccc;
`;

/**
 * Displays full comic detail: cover, file info, action menu, and tabbed panels
 * for metadata, archive operations, and acquisition.
 *
 * @param data.queryClient - react-query client passed through to the CV match
 *   panel so it can invalidate queries after a match is applied.
 * @param data.comicObjectId - optional override for the comic ID; used when the
 *   component is rendered outside a route that provides the ID via `useParams`.
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
    },
    userSettings,
    queryClient,
    comicObjectId: comicObjectIdProp,
  } = data;

  const [activeTab, setActiveTab] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");

  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const { comicVineMatches, prepareAndFetchMatches } = useComicVineMatching();

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

  // Hide "match on Comic Vine" when there are no raw file details — matching
  // requires file metadata to seed the search query.
  const filteredActionOptions: ActionOption[] = actionOptions.filter((item) => {
    if (isUndefined(rawFileDetails)) {
      return item.value !== "match-on-comic-vine";
    }
    return true;
  });

  const handleActionSelection = (action: ActionOption | null) => {
    if (!action) return;
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
        break;
      case "edit-metdata":
        openEditMetadataPanel();
        break;
      default:
        break;
    }
  };

  // Check for metadata availability
  const isComicBookMetadataAvailable =
    !isUndefined(comicvine) && !isUndefined(comicvine?.volumeInformation);

  const hasAnyMetadata =
    isComicBookMetadataAvailable ||
    !isEmpty(comicInfo) ||
    !isNil(locg);

  const areRawFileDetailsAvailable =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails);

  const { issueName, url } = determineCoverFile({
    rawFileDetails,
    comicvine,
    locg,
  });

  // Query for airdc++
  const airDCPPQuery = useMemo(() => ({
    issue: { name: issueName },
  }), [issueName]);

  // Create tab configuration
  const openReconcilePanel = useCallback(() => {
    setSlidingPanelContentId("metadataReconciliation");
    setVisible(true);
  }, []);

  const tabGroup = useMemo(() => createTabConfig({
    data: data.data,
    hasAnyMetadata,
    areRawFileDetailsAvailable,
    airDCPPQuery,
    comicObjectId: _id,
    userSettings,
    issueName,
    acquisition,
    onReconcileMetadata: openReconcilePanel,
  }), [data.data, hasAnyMetadata, areRawFileDetailsAvailable, airDCPPQuery, _id, userSettings, issueName, acquisition, openReconcilePanel]);

  const filteredTabs = useMemo(() => tabGroup.filter((tab) => tab.shouldShow), [tabGroup]);

  // Sliding panel content mapping
  const renderSlidingPanelContent = () => {
    switch (slidingPanelContentId) {
      case "CVMatches":
        return (
          <CVMatchesPanel
            rawFileDetails={rawFileDetails}
            inferredMetadata={inferredMetadata}
            comicVineMatches={comicVineMatches}
            // Prefer the route param; fall back to the data ID when rendered outside a route.
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
                          rawFileDetails,
                          inferredMetadata,
                          createdAt,
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
