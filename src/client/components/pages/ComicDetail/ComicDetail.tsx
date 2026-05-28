import React, { useState, ReactElement, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Card from "../../ui/data-display/Carda";
import { RawFileDetails } from "./components/RawFileDetails";
import TabControls from "./components/TabControls";
import { Menu } from "./action-menu/Menu";
import { isEmpty, isUndefined, isNil, filter } from "lodash";
import { components } from "react-select";
import "react-sliding-pane/dist/react-sliding-pane.css";
import SlidingPane from "react-sliding-pane";
import { determineCoverFile } from "../../../shared/utils/metadata.utils";
import { styled } from "styled-components";
import type { ComicDetailProps } from "../../../types";

// Extracted modules
import { useComicVineMatching } from "./metadata-matching/comicvine/useComicVineMatching";
import { useMetronMatching } from "./metadata-matching/metron/useMetronMatching";
import { useGCDMatching } from "./metadata-matching/gcd/useGCDMatching";
import { createTabConfig } from "./tabConfig";
import { actionOptions, customStyles, ActionOption } from "./action-menu/actionMenuConfig";
import { CVMatchesPanel, MetronMatchesPanel, GCDMatchesPanel, EditMetadataPanelWrapper } from "./components/SlidingPanelContent";

/**
 * Styled sliding panel component with custom background color.
 * Extends the base SlidingPane component with a light gray background.
 */
const StyledSlidingPanel = styled(SlidingPane)`
  background: #ccc;
`;

/**
 * Displays full comic detail view: cover image, file info, action menu, and tabbed panels
 * for metadata, archive operations, and acquisition.
 *
 * This component provides a comprehensive interface for viewing and managing comic book details,
 * including metadata matching from multiple sources (ComicVine, Metron, GCD), file operations,
 * and acquisition tracking.
 *
 * @param {ComicDetailProps} data - Component props containing comic data and configuration
 * @param {Object} data.data - Main comic book data object
 * @param {string} data.data._id - Unique identifier for the comic book record
 * @param {Object} data.data.rawFileDetails - Raw file information extracted from comic archive
 * @param {Object} data.data.inferredMetadata - Metadata inferred from filename and file structure
 * @param {Object} data.data.sourcedMetadata - Metadata from external sources (ComicVine, Metron, etc.)
 * @param {Object} data.data.acquisition - Acquisition tracking information including downloads
 * @param {string} data.data.createdAt - Timestamp when the comic was first imported
 * @param {Object} [data.userSettings] - User preference settings for display and behavior
 * @param {QueryClient} [data.queryClient] - React Query client for cache invalidation after metadata updates
 * @param {string} [data.comicObjectId] - Optional ID override when rendered outside a route context
 *
 * @returns {ReactElement} The rendered comic detail view with cover, metadata, and interactive panels
 *
 * @example
 * ```tsx
 * <ComicDetail
 *   data={{
 *     data: comicData,
 *     userSettings: userPrefs,
 *     queryClient: queryClient
 *   }}
 * />
 * ```
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

  /**
   * Opens the sliding panel with ComicVine search matches.
   * Initiates a search using current raw file details and existing ComicVine metadata,
   * then displays the results in a sliding panel for user selection.
   *
   * @returns {void}
   */
  const openDrawerWithCVMatches = (): void => {
    prepareAndFetchMatches(rawFileDetails, comicvine);
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  };

  /**
   * Opens the sliding panel with Metron search matches.
   * Initiates a search using current raw file details and existing Metron metadata,
   * then displays the results in a sliding panel for user selection.
   *
   * @returns {void}
   */
  const openDrawerWithMetronMatches = (): void => {
    prepareAndFetchMetronMatches(rawFileDetails, metron);
    setSlidingPanelContentId("MetronMatches");
    setVisible(true);
  };

  /**
   * Opens the sliding panel with Grand Comics Database (GCD) search matches.
   * Initiates a search using current raw file details and existing GCD metadata,
   * then displays the results in a sliding panel for user selection.
   *
   * @returns {void}
   */
  const openDrawerWithGCDMatches = (): void => {
    prepareAndFetchGCDMatches(rawFileDetails, gcd);
    setSlidingPanelContentId("GCDMatches");
    setVisible(true);
  };

  /**
   * Opens the sliding panel for editing comic book metadata.
   * Sets the panel content to the edit metadata form and makes the panel visible.
   * Uses useCallback to prevent unnecessary re-renders.
   *
   * @returns {void}
   */
  const openEditMetadataPanel = useCallback((): void => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);

  /**
   * Filters action menu options based on the availability of raw file details.
   * Removes metadata matching options when raw file details are not available,
   * as these operations require file information to perform searches.
   */
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

  /**
   * Handles action selection from the dropdown menu.
   * Routes the selected action to the appropriate handler function based on the action value.
   *
   * @param {ActionOption | null} action - The selected action option from the dropdown menu
   * @returns {void}
   */
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

  /**
   * Determines if raw file details are available and not empty.
   * Used to conditionally show UI elements that depend on file information.
   * @type {boolean}
   */
  const areRawFileDetailsAvailable: boolean =
    !isUndefined(rawFileDetails) && !isEmpty(rawFileDetails);

  /**
   * Determines if ComicVine metadata is available and contains volume information.
   * Used to conditionally show ComicVine-specific UI elements and functionality.
   * @type {boolean}
   */
  const isComicBookMetadataAvailable: boolean =
    !isUndefined(comicvine) && !isUndefined(comicvine?.volumeInformation);

  /**
   * Determines if any metadata is available from any source.
   * Checks ComicVine, ComicInfo, LOCG, and raw file details for available metadata.
   * Used to conditionally show metadata-dependent UI elements.
   * @type {boolean}
   */
  const hasAnyMetadata: boolean =
    isComicBookMetadataAvailable ||
    !isEmpty(comicInfo) ||
    !isNil(locg) ||
    areRawFileDetailsAvailable;

  /**
   * Extracts the cover image URL and issue name from available metadata sources.
   * Uses determineCoverFile utility to prioritize sources: rawFileDetails > comicvine > locg.
   * @type {{ issueName: string, url: string }}
   */
  const { issueName, url } = determineCoverFile({
    rawFileDetails,
    comicvine,
    locg,
  });

  /**
   * Memoized AirDC++ query object for acquisition tracking.
   * Contains the issue name for searching in download clients.
   * @type {{ issue: { name: string } }}
   */
  const airDCPPQuery = useMemo(
    () => ({
      issue: { name: issueName },
    }),
    [issueName],
  );

  /**
   * Opens the sliding panel for metadata reconciliation.
   * Sets the panel content to metadata reconciliation and makes the panel visible.
   * Uses useCallback to prevent unnecessary re-renders.
   *
   * @returns {void}
   */
  const openReconcilePanel = useCallback((): void => {
    setSlidingPanelContentId("metadataReconciliation");
    setVisible(true);
  }, []);

  /**
   * Memoized configuration object for tab creation.
   * Creates tab configuration based on available metadata, user settings, and component state.
   * Includes tabs for metadata display, archive operations, and acquisition tracking.
   * @type {Array}
   */
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

  /**
   * Memoized filtered tabs array containing only tabs that should be displayed.
   * Filters out tabs based on their shouldShow property to conditionally render UI elements.
   * @type {Array}
   */
  const filteredTabs = useMemo(
    () => tabGroup.filter((tab) => tab.shouldShow),
    [tabGroup],
  );

  /**
   * Renders the appropriate content for the sliding panel based on the current panel content ID.
   *
   * This function dynamically renders different panel components based on the slidingPanelContentId:
   * - CVMatches: ComicVine search results panel
   * - MetronMatches: Metron search results panel
   * - GCDMatches: Grand Comics Database search results panel
   * - editComicBookMetadata: Metadata editing form panel
   *
   * @returns {ReactElement | null} The rendered panel content component or null if no valid content ID
   */
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

  /**
   * Returns the appropriate title for the sliding panel based on the current content ID.
   *
   * @returns {string} The panel title string corresponding to the current sliding panel content
   */
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
