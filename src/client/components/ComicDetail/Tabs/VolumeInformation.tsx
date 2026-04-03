import React, { ReactElement, useMemo, useState } from "react";
import { isEmpty, isNil } from "lodash";
import { Drawer } from "vaul";
import ComicVineDetails from "../ComicVineDetails";

interface ComicVineMetadata {
  volumeInformation?: Record<string, unknown>;
  name?: string;
  number?: string;
  resource_type?: string;
  id?: number;
}

interface SourcedMetadata {
  comicvine?: ComicVineMetadata;
  locg?: Record<string, unknown>;
  comicInfo?: unknown;
  metron?: unknown;
  gcd?: unknown;
  [key: string]: unknown;
}

interface VolumeInformationData {
  sourcedMetadata?: SourcedMetadata;
  inferredMetadata?: { issue?: unknown };
  updatedAt?: string;
}

interface VolumeInformationProps {
  data: VolumeInformationData;
  onReconcile?: () => void;
}

/** Sources stored under `sourcedMetadata` — excludes `inferredMetadata`, which is checked separately. */
const SOURCED_METADATA_KEYS = [
  "comicvine",
  "locg",
  "comicInfo",
  "metron",
  "gcd",
];

const SOURCE_LABELS: Record<string, string> = {
  comicvine: "ComicVine",
  locg: "League of Comic Geeks",
  comicInfo: "ComicInfo.xml",
  metron: "Metron",
  gcd: "Grand Comics Database",
  inferredMetadata: "Local File",
};

const SOURCE_ICONS: Record<string, string> = {
  comicvine: "icon-[solar--database-bold]",
  locg: "icon-[solar--users-group-rounded-outline]",
  comicInfo: "icon-[solar--file-text-outline]",
  metron: "icon-[solar--planet-outline]",
  gcd: "icon-[solar--book-outline]",
  inferredMetadata: "icon-[solar--folder-outline]",
};

const MetadataSourceChips = ({
  sources,
}: {
  sources: string[];
}): ReactElement => {
  const [isSheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 mb-5 p-3 w-fit">
        <div className="flex flex-row items-center justify-between">
          <span className="text-md text-slate-500 dark:text-slate-400">
            <i className="icon-[solar--database-outline] w-4 h-4 inline-block align-middle mr-1" />
            {sources.length} metadata sources detected
          </span>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          {sources.map((source) => (
            <span
              key={source}
              className="inline-flex items-center gap-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600"
            >
              <i
                className={`${SOURCE_ICONS[source] ?? "icon-[solar--check-circle-outline]"} w-3 h-3`}
              />
              {SOURCE_LABELS[source] ?? source}
            </span>
          ))}
        </div>
      </div>
      <button
        className="flex space-x-1 mb-2 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
        onClick={() => setSheetOpen(true)}
      >
        <i className="icon-[solar--refresh-outline] w-4 h-4 px-3" />
        Reconcile sources
      </button>

      <Drawer.Root open={isSheetOpen} onOpenChange={setSheetOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content aria-describedby={undefined} className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-slate-800 p-4 outline-none">
            <Drawer.Title className="sr-only">Reconcile metadata sources</Drawer.Title>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="p-4">
              {/* Reconciliation UI goes here */}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};

/**
 * Displays volume metadata for a comic.
 *
 * - When multiple sources are present, renders a chip bar listing each source
 *   with a "Reconcile sources" action to merge them.
 * - When exactly one source is present and it is ComicVine, renders the full
 *   ComicVine detail panel directly.
 *
 * @param props.data - Comic data containing sourced and inferred metadata.
 * @param props.onReconcile - Called when the user triggers source reconciliation.
 */
export const VolumeInformation = (
  props: VolumeInformationProps,
): ReactElement => {
  const { data } = props;

  const presentSources = useMemo(() => {
    const sources = SOURCED_METADATA_KEYS.filter((key) => {
      const val = (data?.sourcedMetadata ?? {})[key];
      if (isNil(val) || isEmpty(val)) return false;
      // locg returns an object even when empty; require at least one non-null value
      if (key === "locg")
        return Object.values(val as Record<string, unknown>).some(
          (v) => !isNil(v) && v !== "",
        );
      return true;
    });
    if (
      !isNil(data?.inferredMetadata?.issue) &&
      !isEmpty(data?.inferredMetadata?.issue)
    ) {
      sources.push("inferredMetadata");
    }
    return sources;
  }, [data?.sourcedMetadata, data?.inferredMetadata]);

  return (
    <div key={1}>
      {presentSources.length > 1 && (
        <MetadataSourceChips sources={presentSources} />
      )}
      {presentSources.length === 1 &&
        data.sourcedMetadata?.comicvine?.volumeInformation && (
          <ComicVineDetails
            data={data.sourcedMetadata.comicvine}
            updatedAt={data.updatedAt}
          />
        )}
    </div>
  );
};

export default VolumeInformation;
