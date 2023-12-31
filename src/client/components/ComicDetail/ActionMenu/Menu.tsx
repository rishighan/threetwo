import React, { ReactElement } from "react";
import Select from "react-select";

export const Menu = (props): ReactElement => {
  const {
    filteredActionOptions,
    customStyles,
    handleActionSelection,
    Placeholder,
  } = props.configuration;

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
