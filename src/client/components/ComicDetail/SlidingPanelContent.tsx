import React from "react";
import { ComicVineSearchForm } from "./ComicVineSearchForm";
import { ComicVineMatchPanel } from "./ComicVineMatchPanel";
import { EditMetadataPanel } from "./EditMetadataPanel";
import type { RawFileDetails, InferredMetadata } from "../../graphql/generated";

interface CVMatchesPanelProps {
  rawFileDetails?: RawFileDetails;
  inferredMetadata: InferredMetadata;
  comicVineMatches: any[];
  comicObjectId: string;
  queryClient: any;
  onMatchApplied: () => void;
};

/**
 * Sliding panel content for ComicVine match search.
 *
 * Renders a search form pre-populated from `rawFileDetails`, a preview of the
 * inferred issue being searched for, and a list of ComicVine match candidates
 * the user can apply to the comic.
 *
 * @param props.onMatchApplied - Called after the user selects and applies a match,
 *   allowing the parent to close the panel and refresh state.
 */
export const CVMatchesPanel: React.FC<CVMatchesPanelProps> = ({
  rawFileDetails,
  inferredMetadata,
  comicVineMatches,
  comicObjectId,
  queryClient,
  onMatchApplied,
}) => (
  <>
    <div>
      <ComicVineSearchForm data={rawFileDetails} />
    </div>

    <div className="border-slate-500 border rounded-lg p-2 mt-3">
      <p className="">Searching for:</p>
      {inferredMetadata.issue ? (
        <>
          <span className="">{inferredMetadata.issue?.name} </span>
          <span className=""> # {inferredMetadata.issue?.number} </span>
        </>
      ) : null}
    </div>
    <ComicVineMatchPanel
      props={{
        comicVineMatches,
        comicObjectId,
        queryClient,
        onMatchApplied,
      }}
    />
  </>
);

type EditMetadataPanelWrapperProps = {
  rawFileDetails?: RawFileDetails;
};

export const EditMetadataPanelWrapper: React.FC<EditMetadataPanelWrapperProps> = ({
  rawFileDetails,
}) => <EditMetadataPanel data={rawFileDetails ?? {}} />;
