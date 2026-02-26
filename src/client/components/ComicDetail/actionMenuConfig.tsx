import React from "react";
import { StylesConfig } from "react-select";

export interface ActionOption {
  value: string;
  label: React.ReactElement;
}

export const CVMatchLabel = (
  <span className="inline-flex flex-row items-center gap-2">
    <div className="w-6 h-6">
      <i className="icon-[solar--magic-stick-3-bold-duotone] w-6 h-6"></i>
    </div>
    <div>Match on ComicVine</div>
  </span>
);

export const editLabel = (
  <span className="inline-flex flex-row items-center gap-2">
    <div className="w-6 h-6">
      <i className="icon-[solar--pen-2-bold-duotone] w-6 h-6"></i>
    </div>
    <div>Edit Metadata</div>
  </span>
);

export const deleteLabel = (
  <span className="inline-flex flex-row items-center gap-2">
    <div className="w-6 h-6">
      <i className="icon-[solar--trash-bin-trash-bold-duotone] w-6 h-6"></i>
    </div>
    <div>Delete Comic</div>
  </span>
);

export const actionOptions: ActionOption[] = [
  { value: "match-on-comic-vine", label: CVMatchLabel },
  { value: "edit-metdata", label: editLabel },
  { value: "delete-comic", label: deleteLabel },
];

export const customStyles: StylesConfig<ActionOption, false> = {
  menu: (base: any) => ({
    ...base,
    backgroundColor: "rgb(156, 163, 175)",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "black",
  }),
  option: (base: any, { isFocused }: any) => ({
    ...base,
    backgroundColor: isFocused ? "gray" : "rgb(156, 163, 175)",
  }),
  singleValue: (base: any) => ({
    ...base,
    paddingTop: "0.4rem",
  }),
  control: (base: any) => ({
    ...base,
    backgroundColor: "rgb(156, 163, 175)",
    color: "black",
    border: "1px solid rgb(156, 163, 175)",
  }),
};
