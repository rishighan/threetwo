import { filter, isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useCallback, useState } from "react";
import Select, { components } from "react-select";
import { fetchComicVineMatches } from "../../../actions/fileops.actions";
import { refineQuery } from "filename-parser";
import { COMICVINE_SERVICE_URI } from "../../../constants/endpoints";
import axios from "axios";

export const Menu = (props): ReactElement => {
  const { data } = props;
  const { setSlidingPanelContentId, setVisible } = props.handlers;
  const [comicVineMatches, setComicVineMatches] = useState([]);

  const fetchComicVineMatches = async (
    searchPayload,
    issueSearchQuery,
    seriesSearchQuery,
  ) => {
    try {
      await axios
        .request({
          url: `${COMICVINE_SERVICE_URI}/volumeBasedSearch`,
          method: "POST",
          data: {
            format: "json",
            // hack
            query: issueSearchQuery.inferredIssueDetails.name
              .replace(/[^a-zA-Z0-9 ]/g, "")
              .trim(),
            limit: "100",
            page: 1,
            resources: "volume",
            scorerConfiguration: {
              searchParams: issueSearchQuery.inferredIssueDetails,
            },
            rawFileDetails: searchPayload.rawFileDetails,
          },
          transformResponse: (r) => {
            const matches = JSON.parse(r);
            return matches;
            // return sortBy(matches, (match) => -match.score);
          },
        })
        .then((response) => {
          let matches: any = [];
          if (
            !isNil(response.data.results) &&
            response.data.results.length === 1
          ) {
            matches = response.data.results;
          } else {
            matches = response.data.map((match) => match);
          }
          setComicVineMatches(matches);
        });
    } catch (err) {
      console.log(err);
    }
  };
  const openDrawerWithCVMatches = () => {
    let seriesSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;
    let issueSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;

    if (!isUndefined(data.rawFileDetails)) {
      issueSearchQuery = refineQuery(data.rawFileDetails.name);
    } else if (!isEmpty(data.sourcedMetadata)) {
      issueSearchQuery = refineQuery(data.sourcedMetadata.comicvine.name);
    }
    fetchComicVineMatches(data, issueSearchQuery, seriesSearchQuery);
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  };

  const openEditMetadataPanel = useCallback(() => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);
  //  Actions menu options and handler
  const CVMatchLabel = (
    <span className="inline-flex flex-row items-center gap-2">
      <div className="w-6 h-6">
        <i className="icon-[solar--magic-stick-3-bold-duotone] w-6 h-6"></i>
      </div>
      <div>Match on ComicVine</div>
    </span>
  );
  const editLabel = (
    <span className="inline-flex flex-row items-center gap-2">
      <div className="w-6 h-6">
        <i className="icon-[solar--pen-2-bold-duotone] w-6 h-6"></i>
      </div>
      <div>Edit Metadata</div>
    </span>
  );
  const deleteLabel = (
    <span className="inline-flex flex-row items-center gap-2">
      <div className="w-6 h-6">
        <i className="icon-[solar--trash-bin-trash-bold-duotone] w-6 h-6"></i>
      </div>
      <div>Delete Comic</div>
    </span>
  );
  const Placeholder = (props) => {
    return <components.Placeholder {...props} />;
  };
  const actionOptions = [
    { value: "match-on-comic-vine", label: CVMatchLabel },
    { value: "edit-metdata", label: editLabel },
    { value: "delete-comic", label: deleteLabel },
  ];

  const filteredActionOptions = filter(actionOptions, (item) => {
    if (isUndefined(data.rawFileDetails)) {
      return item.value !== "match-on-comic-vine";
    }
    return item;
  });
  const handleActionSelection = (action) => {
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
        break;
      case "edit-metdata":
        openEditMetadataPanel();
        break;
      default:
        console.log("No valid action selected.");
        break;
    }
  };
  const customStyles = {
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(156, 163, 175)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "black",
    }),
    option: (base, { data, isDisabled, isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "gray" : "rgb(156, 163, 175)",
    }),
    singleValue: (base) => ({
      ...base,
      paddingTop: "0.4rem",
    }),
    control: (base) => ({
      ...base,
      backgroundColor: "rgb(156, 163, 175)",
      color: "black",
      border: "1px solid rgb(156, 163, 175)",
    }),
  };

  return (
    <Select
      components={{ Placeholder }}
      placeholder={
        <span className="inline-flex flex-row items-center gap-2 pt-1">
          <div className="w-6 h-6">
            <i className="icon-[solar--cursor-bold-duotone] w-6 h-6"></i>
          </div>
          <div>Select An Action</div>
        </span>
      }
      styles={customStyles}
      name="actions"
      isSearchable={false}
      options={filteredActionOptions}
      onChange={handleActionSelection}
    />
  );
};

export default Menu;
