import React, { useEffect, useContext, ReactElement, useState } from "react";
import { RootState } from "threetwo-ui-typings";
import { isEmpty, map } from "lodash";
import prettyBytes from "pretty-bytes";
import dayjs from "dayjs";
import ellipsize from "ellipsize";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "react-router-dom";

interface IDownloadsPanelProps {
  key: number;
}

export const DownloadsPanel = (
  props: IDownloadsPanelProps,
): ReactElement | null => {
  const { comicObjectId } = useParams<{ comicObjectId: string }>();
  const [bundles, setBundles] = useState([]);
  const { airDCPPSocketInstance } = useStore(
    useShallow((state) => ({
      airDCPPSocketInstance: state.airDCPPSocketInstance,
    })),
  );

  // Fetch the downloaded files and currently-downloading file(s) from AirDC++
  const { data: comicObject, isSuccess } = useQuery({
    queryKey: ["bundles"],
    queryFn: async () =>
      await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBookById`,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        data: {
          id: `${comicObjectId}`,
        },
      }),
  });

  const getBundles = async (comicObject) => {
    if (comicObject?.data.acquisition.directconnect) {
      const filteredBundles =
        comicObject.data.acquisition.directconnect.downloads.map(
          async ({ bundleId }) => {
            return await airDCPPSocketInstance.get(`queue/bundles/${bundleId}`);
          },
        );
      return await Promise.all(filteredBundles);
    }
  };

  useEffect(() => {
    getBundles(comicObject).then((result) => {
      setBundles(result);
    });
  }, [comicObject]);

  const Bundles = (props) => {
    return (
      <div className="overflow-x-auto w-fit mt-4 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-200 text-md">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Filename
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Size
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Download Time
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-slate-200">
                Bundle ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {map(props.data, (bundle) => (
              <tr key={bundle.id} className="text-sm">
                <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                  <h5>{ellipsize(bundle.name, 58)}</h5>
                  <span className="is-size-7">
                    {ellipsize(bundle.target, 68)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                  {prettyBytes(bundle.size)}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                  {dayjs
                    .unix(bundle.time_finished)
                    .format("h:mm on ddd, D MMM, YYYY")}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-gray-700 dark:text-slate-300">
                  <span className="tag is-warning">{bundle.id}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="columns is-multiline">
      {!isEmpty(airDCPPSocketInstance) && !isEmpty(bundles) && (
        <Bundles data={bundles} />
      )}
    </div>
  );
};
export default DownloadsPanel;
