import React, { ReactElement, useEffect, useState } from "react";
import { isEmpty, isNil } from "lodash";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import MetadataPanel from "../shared/MetadataPanel";
import type { DownloadsProps } from "../../types";
import { useStore } from "../../store";

interface BundleData {
  rawFileDetails?: Record<string, unknown>;
  inferredMetadata?: Record<string, unknown>;
  acquisition?: {
    directconnect?: {
      downloads?: Array<{
        name: string;
        size: number;
        type: { str: string };
        bundleId: string;
      }>;
    };
  };
  sourcedMetadata?: {
    locg?: unknown;
    comicvine?: unknown;
  };
  issueName?: string;
  url?: string;
}

export const Downloads = (_props: DownloadsProps): ReactElement => {
  // Using Zustand store for socket management
  const getSocket = useStore((state) => state.getSocket);
  
  const [bundles, setBundles] = useState<BundleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize socket connection and load data
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      // Socket is connected, we could fetch transfers here
      // For now, just set loading to false since we don't have direct access to Redux state
      setIsLoading(false);
    }
  }, [getSocket]);

  return !isNil(bundles) && bundles.length > 0 ? (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <section className="section">
        <h1 className="title">Downloads</h1>
        <div className="columns">
          <div className="column is-half">
            {bundles.map((bundle, idx) => {
              return (
                <div key={idx}>
                  <MetadataPanel
                    data={bundle}
                    imageStyle={{ maxWidth: 80 }}
                    titleStyle={{ fontSize: "0.8rem" }}
                    tagsStyle={{ fontSize: "0.7rem" }}
                    containerStyle={{
                      maxWidth: 400,
                      padding: 0,
                      margin: "0 0 8px 0",
                    }}
                  />

                  <table className="table is-size-7">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Type</th>
                        <th>Bundle ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bundle.acquisition?.directconnect?.downloads?.map(
                        (download, idx: number) => {
                          return (
                            <tr key={idx}>
                              <td>{download.name}</td>
                              <td>{download.size}</td>
                              <td>{download.type.str}</td>
                              <td>
                                <span className="tag is-warning">
                                  {download.bundleId}
                                </span>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                  {/* <pre>{JSON.stringify(bundle.acquisition.directconnect.downloads, null, 2)}</pre> */}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  ) : (
    <div>There are no downloads.</div>
  );
};

export default Downloads;
