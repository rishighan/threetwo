import React, { ReactElement, useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Field } from "react-final-form";
import { Link } from "react-router-dom";
import { searchIssue } from "../../actions/fileops.actions";

export const SearchBar = (props): ReactElement => {
  const { searchHandler } = props;
  const handleSubmit = useCallback((e) => {
    //   searchIssue(
    //     {
    //       query: {
    //         volumeName: e.search,
    //       },
    //     },
    //     {
    //       pagination: {
    //         size: 25,
    //         from: 0,
    //       },
    //       type: "volumeName",
    //       trigger: "libraryPage",
    //     },
    //   ),
  }, []);
  return (
    <Form
      onSubmit={searchHandler}
      initialValues={{}}
      render={({ handleSubmit, form, submitting, pristine, values }) => (
        <form onSubmit={handleSubmit}>
          <Field name="search">
            {({ input, meta }) => {
              return (
                <div className="flex flex-row w-full">
                  <div className="flex flex-row bg-slate-300 dark:bg-slate-500 rounded-l-lg p-2 min-w-full">
                    <div className="w-10 text-gray-400">
                      <i className="icon-[solar--magnifer-bold-duotone] h-7 w-7" />
                    </div>

                    <input
                      {...input}
                      className="bg-slate-300 dark:bg-slate-500 outline-none text-lg text-gray-700 w-full"
                      type="text"
                      id="search"
                      placeholder="Type an issue/volume name"
                    />
                  </div>

                  <button
                    className="sm:mt-0 rounded-r-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                    type="submit"
                  >
                    Search
                  </button>
                </div>
              );
            }}
          </Field>
        </form>
      )}
    />
  );
};

export default SearchBar;
