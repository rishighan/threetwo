import { ReactElement, useMemo, useState } from "react";
import { isEmpty, isNil } from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ComicVineDetails from "../metadata-matching/comicvine/ComicVineDetails";
import { ReconcilerDrawer } from "./reconciler/ReconcilerDrawer";
import { fetcher } from "../../../../graphql/fetcher";
import { useGetComicByIdQuery } from "../../../../graphql/generated";
import type { CanonicalRecord } from "./reconciler/useReconciler";
import type { RawFileDetails as RawFileDetailsType } from "../../../../graphql/generated";
import cvLogo from "../../../../assets/img/cvlogo.svg";
import locgLogo from "../../../../assets/img/locglogo.svg";
import gcdLogo from "../../../../assets/img/gcd_logo.png";
import metronLogo from "../../../../assets/img/metron_logo.png";

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
  id?: string;
  sourcedMetadata?: SourcedMetadata;
  inferredMetadata?: { issue?: unknown };
  rawFileDetails?: RawFileDetailsType;
  createdAt?: string;
  updatedAt?: string;
}

interface VolumeInformationProps {
  data: VolumeInformationData;
  onReconcile?: () => void;
}

const SET_METADATA_FIELD = `
  mutation SetMetadataField($comicId: ID!, $field: String!, $value: String!) {
    setMetadataField(comicId: $comicId, field: $field, value: $value) {
      id
    }
  }
`;

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
  comicvine: cvLogo,
  locg: locgLogo,
  comicInfo: "icon-[solar--file-text-outline]",
  metron: metronLogo,
  gcd: gcdLogo,
  inferredMetadata: "icon-[solar--file-text-outline]",
};

const SOURCE_BG_COLORS: Record<string, string> = {
  comicvine: "bg-[#f0faf5] dark:bg-[#1a3d2e]",
  locg: "bg-[#fff5f0] dark:bg-[#3d2a1a]",
  metron: "bg-[#f0f3ff] dark:bg-[#1a2440]",
  gcd: "bg-[#fdf8f0] dark:bg-[#3d3520]",
  comicInfo: "bg-slate-50 dark:bg-slate-700",
  inferredMetadata: "bg-slate-50 dark:bg-slate-700",
};

const MetadataSourceChips = ({
  sources,
  onOpenReconciler,
}: {
  sources: string[];
  onOpenReconciler: () => void;
}): ReactElement => {
  return (
    <div className="flex flex-col gap-2 mb-5 w-fit">
      <div className="flex flex-row items-center justify-between">
        <span className="text-md text-slate-500 dark:text-slate-400">
          {sources.length} metadata sources detected.
        </span>
      </div>
      <dl className="flex flex-row flex-wrap gap-2">
        {sources.map((source) => {
          const iconValue =
            SOURCE_ICONS[source] ?? "icon-[solar--check-circle-outline]";
          const isIconClass = iconValue.startsWith("icon-[");
          const bgColor =
            SOURCE_BG_COLORS[source] ?? "bg-slate-50 dark:bg-slate-700";

          return (
            <dd
              className="mt-1 text-sm text-gray-500 dark:text-slate-100"
              key={source}
            >
              <span
                className={`inline-flex items-center ${bgColor} text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-100`}
              >
                <span className="pr-1 pt-1">
                  {isIconClass ? (
                    <i className={`${iconValue} w-4 h-4`} />
                  ) : (
                    <img
                      src={iconValue}
                      alt={SOURCE_LABELS[source]}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                </span>
                <span className="text-md text-slate-500 dark:text-slate-100">
                  {SOURCE_LABELS[source] ?? source}
                </span>
              </span>
            </dd>
          );
        })}
      </dl>
      <button
        className="flex space-x-1 w-fit mb-2 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
        onClick={onOpenReconciler}
      >
        <i className="icon-[solar--refresh-outline] w-4 h-4 px-3" />
        Reconcile sources
      </button>
    </div>
  );
};

/**
 * Checks if a metadata source has valid data.
 * Special handling for locg which returns an empty object even when no data exists.
 * Also handles JSON strings from GraphQL which need to be parsed first.
 */
const hasValidMetadata = (key: string, val: unknown): boolean => {
  if (isNil(val) || isEmpty(val)) {
    return false;
  }

  // Handle JSON strings (like gcd, comicvine, metron, comicInfo from GraphQL)
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      // Check if parsed object has meaningful data
      if (isNil(parsed) || isEmpty(parsed)) {
        return false;
      }
      // For parsed objects, check if they have any non-empty values
      if (typeof parsed === "object") {
        return Object.values(parsed).some((v) => !isNil(v) && v !== "");
      }
      return true;
    } catch (error) {
      // If JSON parsing fails, treat as invalid
      console.warn(`Failed to parse JSON for ${key}:`, error);
      return false;
    }
  }

  // locg returns an object even when empty; require at least one non-null value
  if (key === "locg") {
    return Object.values(val as Record<string, unknown>).some(
      (v) => !isNil(v) && v !== "",
    );
  }

  return true;
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
  const [isReconcilerOpen, setReconcilerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: saveCanonical } = useMutation({
    mutationFn: async (record: CanonicalRecord) => {
      const saves = Object.entries(record)
        .filter(([, fv]) => fv != null)
        .map(([field, fv]) => ({
          field,
          value:
            typeof fv!.value === "string"
              ? fv!.value
              : JSON.stringify(fv!.value),
        }));
      await Promise.all(
        saves.map(({ field, value }) =>
          fetcher<unknown, { comicId: string; field: string; value: string }>(
            SET_METADATA_FIELD,
            { comicId: data.id ?? "", field, value },
          )(),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetComicByIdQuery.getKey({ id: data.id ?? "" }),
      });
    },
  });

  const presentSources = useMemo(() => {
    const sources = SOURCED_METADATA_KEYS.filter((key) => {
      const val = (data?.sourcedMetadata ?? {})[key];
      return hasValidMetadata(key, val);
    });
    const hasLocalFile =
      (!isNil(data?.rawFileDetails) && !isEmpty(data?.rawFileDetails)) ||
      (!isNil(data?.inferredMetadata?.issue) &&
        !isEmpty(data?.inferredMetadata?.issue));
    if (hasLocalFile) {
      sources.push("inferredMetadata");
    }

    return sources;
  }, [data?.sourcedMetadata, data?.inferredMetadata, data?.rawFileDetails]);

  const onlyComicvine =
    presentSources.length === 1 &&
    !!data.sourcedMetadata?.comicvine?.volumeInformation;

  return (
    <div key={1}>
      {(presentSources.length > 1 ||
        (presentSources.length === 1 && !onlyComicvine)) && (
        <MetadataSourceChips
          sources={presentSources}
          onOpenReconciler={() => setReconcilerOpen(true)}
        />
      )}
      {onlyComicvine && (
        <ComicVineDetails
          data={data.sourcedMetadata!.comicvine!}
          updatedAt={data.updatedAt}
        />
      )}
      <ReconcilerDrawer
        open={isReconcilerOpen}
        onOpenChange={setReconcilerOpen}
        sourcedMetadata={
          (data.sourcedMetadata ??
            {}) as unknown as import("./reconciler/useReconciler").RawSourcedMetadata
        }
        inferredMetadata={
          data.inferredMetadata as
            | import("./reconciler/useReconciler").RawInferredMetadata
            | undefined
        }
        onSave={saveCanonical}
      />
    </div>
  );
};

export default VolumeInformation;
