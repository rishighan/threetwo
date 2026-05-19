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
import { useMetronMatching } from "./useMetronMatching";
import { useGCDMatching } from "./useGCDMatching";
import { createTabConfig } from "./tabConfig";
import { actionOptions, customStyles, ActionOption } from "./actionMenuConfig";
import {
  CVMatchesPanel,
  MetronMatchesPanel,
  GCDMatchesPanel,
  EditMetadataPanelWrapper,
} from "./SlidingPanelContent";

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
      sourcedMetadata,
      acquisition,
      createdAt,
    },
    userSettings,
    queryClient,
    comicObjectId: comicObjectIdProp,
  } = data;

  // Safely destructure sourcedMetadata with defaults for optional fields
  const { comicvine, locg, comicInfo, metron } = sourcedMetadata || {};
  // GCD metadata may exist in sourcedMetadata
  const gcd = (sourcedMetadata as Record<string, unknown> | undefined)?.gcd as
    | Record<string, unknown>
    | undefined;

  const [activeTab, setActiveTab] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [slidingPanelContentId, setSlidingPanelContentId] = useState("");

  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const { comicVineMatches, prepareAndFetchMatches } = useComicVineMatching();
  const {
    metronMatches,
    prepareAndFetchMatches: prepareAndFetchMetronMatches,
  } = useMetronMatching();
  const {
    gcdMatches,
    isLoading: gcdLoading,
    error: gcdError,
    prepareAndFetchMatches: prepareAndFetchGCDMatches,
  } = useGCDMatching();

  const openDrawerWithCVMatches = (): void => {
    prepareAndFetchMatches(rawFileDetails, comicvine);
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  };

  const openDrawerWithMetronMatches = (): void => {
    prepareAndFetchMetronMatches(rawFileDetails, metron);
    setSlidingPanelContentId("MetronMatches");
    setVisible(true);
  };

  const openDrawerWithGCDMatches = (): void => {
    prepareAndFetchGCDMatches(rawFileDetails, gcd);
    setSlidingPanelContentId("GCDMatches");
    setVisible(true);
  };

  const openEditMetadataPanel = useCallback((): void => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);

  const filteredActionOptions: ActionOption[] = actionOptions.filter((item) => {
    if (isUndefined(rawFileDetails)) {
      return (
        item.value !== "match-on-comic-vine" &&
        item.value !== "match-on-metron" &&
        item.value !== "match-on-gcd"
      );
    }
    return true;
  });

  const handleActionSelection = (action: ActionOption | null): void => {
    if (!action) return;
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
        break;
      case "match-on-metron":
        openDrawerWithMetronMatches();
        break;
      case "match-on-gcd":
        openDrawerWithGCDMatches();
        break;
      case "edit-metdata":
        openEditMetadataPanel();
        break;
      default:
        break;
    }
  };

  const areRawFileDetailsAvailable: boolean =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails);

  const isComicBookMetadataAvailable: boolean =
    !isUndefined(comicvine) && !isUndefined(comicvine?.volumeInformation);

  const hasAnyMetadata: boolean =
    isComicBookMetadataAvailable ||
    !isEmpty(comicInfo) ||
    !isNil(locg) ||
    areRawFileDetailsAvailable;

  const { issueName, url } = determineCoverFile({
    rawFileDetails,
    comicvine,
    locg,
  });

  const airDCPPQuery = useMemo(
    () => ({
      issue: { name: issueName },
    }),
    [issueName],
  );

  const openReconcilePanel = useCallback((): void => {
    setSlidingPanelContentId("metadataReconciliation");
    setVisible(true);
  }, []);

  const tabGroup = useMemo(
    () =>
      createTabConfig({
        data: data.data,
        hasAnyMetadata,
        areRawFileDetailsAvailable,
        airDCPPQuery,
        comicObjectId: _id,
        userSettings,
        issueName,
        acquisition,
        onReconcileMetadata: openReconcilePanel,
      }),
    [
      data.data,
      hasAnyMetadata,
      areRawFileDetailsAvailable,
      airDCPPQuery,
      _id,
      userSettings,
      issueName,
      acquisition,
      openReconcilePanel,
    ],
  );

  const filteredTabs = useMemo(
    () => tabGroup.filter((tab) => tab.shouldShow),
    [tabGroup],
  );

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
            onManualSearch={(formValues) =>
              prepareAndFetchMatches(rawFileDetails, comicvine, formValues)
            }
          />
        );
      case "MetronMatches":
        return (
          <MetronMatchesPanel
            rawFileDetails={rawFileDetails}
            inferredMetadata={inferredMetadata}
            metronMatches={metronMatches}
            comicObjectId={comicObjectId || _id}
            queryClient={queryClient}
            onMatchApplied={() => {
              setVisible(false);
              setActiveTab(1);
            }}
            onManualSearch={(formValues) =>
              prepareAndFetchMetronMatches(rawFileDetails, metron, formValues)
            }
          />
        );
      case "GCDMatches":
        return (
          <GCDMatchesPanel
            rawFileDetails={rawFileDetails}
            inferredMetadata={inferredMetadata}
            gcdMatches={gcdMatches}
            comicObjectId={comicObjectId || _id}
            queryClient={queryClient}
            onMatchApplied={() => {
              setVisible(false);
              setActiveTab(1);
            }}
            onManualSearch={(formValues) =>
              prepareAndFetchGCDMatches(rawFileDetails, gcd, formValues)
            }
            isLoading={gcdLoading}
            error={gcdError}
          />
        );
      case "editComicBookMetadata":
        return <EditMetadataPanelWrapper rawFileDetails={rawFileDetails} />;
      default:
        return null;
    }
  };

  const getSlidingPanelTitle = (): string => {
    switch (slidingPanelContentId) {
      case "CVMatches":
        return "Comic Vine Search Matches";
      case "MetronMatches":
        return "Metron Search Matches";
      case "GCDMatches":
        return "Grand Comics Database Matches";
      case "editComicBookMetadata":
        return "Edit Metadata";
      default:
        return "Panel";
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
              title={getSlidingPanelTitle()}
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
