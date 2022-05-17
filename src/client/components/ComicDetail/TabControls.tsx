import React, { ReactElement, useEffect, useState } from "react";
import { isEmpty, isNil } from "lodash";
import { useSelector } from "react-redux";

export const TabControls = (props): ReactElement => {
  const comicBookDetailData = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail,
  );
  const { filteredTabs } = props;

  const [active, setActive] = useState(filteredTabs[0].id);
  useEffect(() => {
    console.log("changed");
    setActive(filteredTabs[0].id);
  }, [comicBookDetailData]);

  return (
    <>
      <div className="tabs">
        <ul>
          {filteredTabs.map(({ id, name, icon }) => (
            <li
              key={id}
              className={id === active ? "is-active" : ""}
              onClick={() => setActive(id)}
            >
              {/* Downloads tab and count badge */}
              <a>
                {id === 5 &&
                !isNil(comicBookDetailData) &&
                !isEmpty(comicBookDetailData) ? (
                  <span className="download-icon-labels">
                    <i className="fa-solid fa-download"></i>
                    <span className="tag downloads-count is-info is-light">
                      {comicBookDetailData.acquisition.directconnect.length}
                    </span>
                  </span>
                ) : (
                  <span className="icon is-small">{icon}</span>
                )}
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {filteredTabs.map(({ id, content }) => {
        return active === id ? content : null;
      })}
    </>
  );
};

export default TabControls;