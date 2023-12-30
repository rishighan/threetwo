import React, { ReactElement, useEffect, useState } from "react";
import { isNil } from "lodash";

export const TabControls = (props): ReactElement => {
  // const comicBookDetailData = useSelector(
  //   (state: RootState) => state.comicInfo.comicBookDetail,
  // );
  const { filteredTabs, acquisition } = props;
  const [active, setActive] = useState(filteredTabs[0].id);
  useEffect(() => {
    setActive(filteredTabs[0].id);
  }, [acquisition]);

  return (
    <>
      <div className="hidden sm:block mt-7 mb-3 w-fit">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6" aria-label="Tabs">
            {filteredTabs.map(({ id, name, icon }) => (
              <a
                key={id}
                className="inline-flex shrink-0 items-center gap-2 border-b border-transparent px-1 py-1 text-md font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700"
                aria-current="page"
                onClick={() => setActive(id)}
              >
                {/* Downloads tab and count badge */}
                <>
                  {id === 6 && !isNil(acquisition.directconnect) ? (
                    <span className="inline-flex flex-row">
                      {/* download count */}
                      <span className="inline-flex mx-2 items-center bg-slate-200 text-slate-800 text-xs font-medium px-2 rounded-md dark:text-slate-900 dark:bg-slate-400">
                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {acquisition.directconnect.downloads.length}
                        </span>
                      </span>
                      <i className="h-5 w-5 icon-[solar--download-bold-duotone] text-slate-500 dark:text-slate-300" />
                    </span>
                  ) : (
                    <span className="w-5 h-5">{icon}</span>
                  )}
                  {name}
                </>
              </a>
            ))}
          </nav>
        </div>
      </div>
      {filteredTabs.map(({ id, content }) => {
        return active === id ? content : null;
      })}
    </>
  );
};

export default TabControls;
