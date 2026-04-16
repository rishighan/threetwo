import { isArray, map } from "lodash";
import React, { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "../shared/Carda";
import ellipsize from "ellipsize";
import { LIBRARY_SERVICE_HOST, LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import prettyBytes from "pretty-bytes";

interface PotentialLibraryMatchesProps {
  matches: string[];
}

interface ComicBookMatch {
  rawFileDetails: {
    cover: {
      filePath: string;
    };
    name: string;
    containedIn: string;
    extension: string;
    fileSize: number;
  };
}

const PotentialLibraryMatches = (props: PotentialLibraryMatchesProps): ReactElement => {
  const { data } = useQuery({
    queryKey: ["comicBooksDetails", props.matches],
    queryFn: async () =>
      axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooksByIds`,
        method: "POST",
        data: { ids: props.matches },
      }),
    enabled: props.matches.length > 0,
  });
  const comicBooks: ComicBookMatch[] = data?.data ?? [];
  return (
    <div className="potential-matches-container mt-10">
      {isArray(comicBooks) ? (
        map(comicBooks, (match) => {
          const encodedFilePath = encodeURI(
            `${LIBRARY_SERVICE_HOST}/${match.rawFileDetails.cover.filePath}`,
          );
          const filePath = escapePoundSymbol(encodedFilePath);
          return (
            <div className="potential-issue-match mb-3">
              <div className="columns">
                <div className="column is-one-fifth">
                  <Card
                    imageUrl={filePath}
                    orientation={"vertical"}
                    hasDetails={false}
                  />
                </div>

                <div className="search-result-details column">
                  <div className="is-size-5">{match.rawFileDetails.name}</div>
                  <pre className="code is-size-7">
                    {match.rawFileDetails.containedIn}
                  </pre>
                  <div className="field is-grouped is-grouped-multiline mt-4">
                    <div className="control">
                      <div className="tags has-addons">
                        <span className="tag">File Type</span>
                        <span className="tag is-primary">
                          {match.rawFileDetails.extension}
                        </span>
                      </div>
                    </div>
                    <div className="control">
                      <div className="tags has-addons">
                        <span className="tag">File Size</span>
                        <span className="tag is-warning">
                          {prettyBytes(match.rawFileDetails.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div>No matches found in library.</div>
      )}
    </div>
  );
};

export default PotentialLibraryMatches;
