import { filter, isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useCallback } from "react";
import Select, { components } from "react-select";
import { fetchComicVineMatches } from "../../../actions/fileops.actions";
import { refineQuery } from "filename-parser";

export const Menu = (props): ReactElement => {
  const { data } = props;
  const { setSlidingPanelContentId, setVisible } = props.handlers;
  const openDrawerWithCVMatches = useCallback(() => {
    let seriesSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;
    let issueSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;

    if (!isUndefined(data.rawFileDetails)) {
      issueSearchQuery = refineQuery(data.rawFileDetails.name);
    } else if (!isEmpty(data.sourcedMetadata)) {
      issueSearchQuery = refineQuery(data.sourcedMetadata.comicvine.name);
    }
    // dispatch(fetchComicVineMatches(data, issueSearchQuery, seriesSearchQuery));
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  }, [data]);

  const openEditMetadataPanel = useCallback(() => {
    setSlidingPanelContentId("editComicBookMetadata");
    setVisible(true);
  }, []);
  //  Actions menu options and handler
  const CVMatchLabel = (
    <span>
      <i className="fa-solid fa-wand-magic"></i> Match on ComicVine
    </span>
  );
  const editLabel = (
    <span>
      <i className="fa-regular fa-pen-to-square"></i> Edit Metadata
    </span>
  );
  const deleteLabel = (
    <span>
      <i className="fa-regular fa-trash-alt"></i> Delete Comic
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
    placeholder: (base) => ({
      ...base,
      color: "black",
    }),
    option: (base, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...base,
        backgroundColor: isFocused ? "gray" : "rgb(156, 163, 175)",
      };
    },
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
      placeholder={<span>Select Action</span>}
      styles={customStyles}
      name="actions"
      isSearchable={false}
      options={filteredActionOptions}
      onChange={handleActionSelection}
    />
  );
};

export default Menu;
