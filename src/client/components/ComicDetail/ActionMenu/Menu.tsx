import React, { ReactElement } from "react";
import Select, { StylesConfig, SingleValue } from "react-select";
import { ActionOption } from "../actionMenuConfig";

interface MenuConfiguration {
  filteredActionOptions: ActionOption[];
  customStyles: StylesConfig<ActionOption, false>;
  handleActionSelection: (action: SingleValue<ActionOption>) => void;
}

interface MenuProps {
  data?: unknown;
  handlers?: {
    setSlidingPanelContentId: (id: string) => void;
    setVisible: (visible: boolean) => void;
  };
  configuration: MenuConfiguration;
}

export const Menu = (props: MenuProps): ReactElement => {
  const {
    filteredActionOptions,
    customStyles,
    handleActionSelection,
  } = props.configuration;

  return (
    <Select<ActionOption, false>
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
