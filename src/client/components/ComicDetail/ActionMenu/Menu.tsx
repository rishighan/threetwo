import { filter, isEmpty, isNil, isUndefined } from "lodash";
import React, { ReactElement, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select, { components } from "react-select";
import { fetchComicVineMatches } from "../../../actions/fileops.actions";
import { refineQuery } from "filename-parser";

export const Menu = (props): ReactElement => {
  const { data } = props;
  const { setSlidingPanelContentId, setVisible } = props.handlers;
  const dispatch = useDispatch();
  const openDrawerWithCVMatches = useCallback(() => {
    let seriesSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;
    let issueSearchQuery: IComicVineSearchQuery = {} as IComicVineSearchQuery;

    if (!isUndefined(data.rawFileDetails)) {
      issueSearchQuery = refineQuery(data.rawFileDetails.name);
    } else if (!isEmpty(data.sourcedMetadata)) {
      issueSearchQuery = refineQuery(data.sourcedMetadata.comicvine.name);
    }
    dispatch(fetchComicVineMatches(data, issueSearchQuery, seriesSearchQuery));
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  }, [dispatch, data]);

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

  return (
    <Select
      className="basic-single"
      classNamePrefix="select"
      components={{ Placeholder }}
      placeholder={
        <span>
          <i className="fa-solid fa-list"></i> Actions
        </span>
      }
      name="actions"
      isSearchable={false}
      options={filteredActionOptions}
      onChange={handleActionSelection}
    />
  );
};

export default Menu;
