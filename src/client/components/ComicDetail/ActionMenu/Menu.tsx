import React, { ReactElement } from "react";
import Select from "react-select";

export const Menu = (props: any): ReactElement => {
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
        <span className="inline-flex flex-row items-center gap-1.5 pt-1">
          <div className="w-4 h-4">
            <i className="icon-[solar--cursor-bold-duotone] w-4 h-4"></i>
          </div>
          <div className="text-sm">Select An Action</div>
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
