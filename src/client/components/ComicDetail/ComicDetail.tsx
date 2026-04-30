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

const StyledSlidingPanel = styled(SlidingPane)`
  background: #ccc;
`;

/**
 * Displays full comic detail view: cover image, file info, action menu, and tabbed panels
 * for metadata, archive operations, and acquisition.
 *
 * @param {ComicDetailProps} props - Component props
 * @param {Object} props.data - Comic book data containing rawFileDetails, inferredMetadata, sourcedMetadata, and acquisition
 * @param {Object} [props.userSettings] - User preference settings
 * @param {QueryClient} [props.queryClient] - React Query client for cache invalidation after CV match
 * @param {string} [props.comicObjectId] - Optional ID override when rendered outside a route
 * @returns {ReactElement} The rendered comic detail view
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

  const openDrawerWithCVMatches = (): void => {
    prepareAndFetchMatches(rawFileDetails, comicvine);
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  };

  const openEditMetadataPanel = useCallback((): void => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);

  const filteredActionOptions: ActionOption[] = actionOptions.filter((item) => {
    if (isUndefined(rawFileDetails)) {
      return item.value !== "match-on-comic-vine";
    }
    return true;
  });

  const handleActionSelection = (action: ActionOption | null): void => {
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

  const isComicBookMetadataAvailable: boolean =
    !isUndefined(comicvine) && !isUndefined(comicvine?.volumeInformation);

  const hasAnyMetadata: boolean =
    isComicBookMetadataAvailable ||
    !isEmpty(comicInfo) ||
    !isNil(locg) ||
    areRawFileDetailsAvailable;

  const areRawFileDetailsAvailable: boolean =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails);

  const { issueName, url } = determineCoverFile({
    rawFileDetails,
    comicvine,
    locg,
  });

  const airDCPPQuery = useMemo(() => ({
    issue: { name: issueName },
  }), [issueName]);

  const openReconcilePanel = useCallback((): void => {
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

  const renderSlidingPanelContent = (): ReactElement | null => {
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
            onManualSearch={(formValues) => prepareAndFetchMatches(rawFileDetails, comicvine, formValues)}
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
