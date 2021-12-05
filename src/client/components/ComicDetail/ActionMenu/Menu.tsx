import React, { ReactElement, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select, { components } from "react-select";
import { fetchComicVineMatches } from "../../../actions/fileops.actions";

export const Menu = (props): ReactElement => {
  const { data } = props;
  const { setSlidingPanelContentId, setVisible } = props.handlers;
  const dispatch = useDispatch();
  const openDrawerWithCVMatches = useCallback(() => {
    dispatch(fetchComicVineMatches(data));
    setSlidingPanelContentId("CVMatches");
    setVisible(true);
  }, [dispatch, data]);
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

  const handleActionSelection = (action) => {
    switch (action.value) {
      case "match-on-comic-vine":
        openDrawerWithCVMatches();
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
      options={actionOptions}
      onChange={handleActionSelection}
    />
  );
};

export default Menu;
