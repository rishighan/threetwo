import React from "react";
import { ComicVineSearchForm } from "./ComicVineSearchForm";
import { ComicVineMatchPanel } from "./ComicVineMatchPanel";
import { EditMetadataPanel } from "./EditMetadataPanel";

interface InferredIssue {
  name?: string;
  number?: number;
  year?: string;
  subtitle?: string;
  [key: string]: any;
}

interface CVMatchesPanelProps {
  rawFileDetails: any;
  inferredMetadata: {
    issue?: InferredIssue;
  };
  comicVineMatches: any[];
  comicObjectId: string;
  queryClient: any;
  onMatchApplied: () => void;
}

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

interface EditMetadataPanelWrapperProps {
  rawFileDetails: any;
}

export const EditMetadataPanelWrapper: React.FC<EditMetadataPanelWrapperProps> = ({
  rawFileDetails,
}) => <EditMetadataPanel data={rawFileDetails} />;
