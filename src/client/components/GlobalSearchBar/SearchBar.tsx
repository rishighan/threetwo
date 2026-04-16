import { debounce, isEmpty, map } from "lodash";
import React, { ReactElement, useCallback, useState } from "react";
import axios from "axios";
import Card from "../shared/Carda";

import MetadataPanel from "../shared/MetadataPanel";
import { SEARCH_SERVICE_BASE_URI } from "../../constants/endpoints";
import type { GlobalSearchBarProps } from "../../types";

export const SearchBar = (data: GlobalSearchBarProps): ReactElement => {
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);

  const performSearch = useCallback(
    debounce(async (e) => {
      const response = await axios({
        url: `${SEARCH_SERVICE_BASE_URI}/searchIssue`,
        method: "POST",
        data: {
          query: { volumeName: e.target.value },
          pagination: { size: 25, from: 0 },
          type: "volumeName",
          trigger: "globalSearchBar",
        },
      });
      setSearchResults(response.data?.hits ?? []);
    }, 500),
    [data],
  );
  return (
    <>
      <div className="control has-icons-right">
        <input
          className="input mt-2"
          placeholder="Search Library"
          onChange={(e) => performSearch(e)}
        />

        {/* TODO: Switch to Solar icon */}
        <span className="icon is-right mt-2">
          <i className="fa-solid fa-magnifying-glass"></i>
        </span>
      </div>
      {!isEmpty(searchResults) ? (
        <div
          className="columns box is-multiline"
          style={{
            padding: 4,
            position: "absolute",
            width: 360,
            margin: "60px 0 0 350px",
          }}
        >
          {map(searchResults, (result, idx) => (
            <MetadataPanel
              data={result}
              key={idx}
              imageStyle={{ maxWidth: 70 }}
              titleStyle={{ fontSize: "0.8rem" }}
              tagsStyle={{ fontSize: "0.7rem" }}
              containerStyle={{
                width: "100vw",
                padding: 0,
                margin: "0 0 8px 0",
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
