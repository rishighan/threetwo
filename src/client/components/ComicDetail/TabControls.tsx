import React, { ReactElement, useEffect, useState } from "react";
import { isEmpty, isNil } from "lodash";

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
                className="inline-flex shrink-0 items-center gap-2 border-b border-transparent px-1 py-1 text-md font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                aria-current="page"
                onClick={() => setActive(id)}
              >
                {/* Downloads tab and count badge */}
                {/* <a>
                {id === 6 && !isNil(acquisition.directconnect) ? (
                  <span className="download-icon-labels">
                    <i className="fa-solid fa-download"></i>
                    <span className="tag downloads-count is-info is-light">
                      {acquisition.directconnect.downloads.length}
                    </span>
                  </span>
                ) : (
                  <span className="icon is-small">{icon}</span>
                )}
                {name}
              </a> */}
                <span className="w-5 h-5">{icon}</span>
                {name}
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
