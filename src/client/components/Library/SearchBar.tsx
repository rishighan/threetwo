import React, { ReactElement, useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Field } from "react-final-form";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";

export const SearchBar = (): ReactElement => {
  const dispatch = useDispatch();
  const handleSubmit = useCallback((e) => {
    dispatch(
      searchIssue(
        {
          query: {
            volumeName: e.search,
          },
        },
        {
          pagination: {
            size: 25,
            from: 0,
          },
          type: "volumeName",
          trigger: "libraryPage",
        },
      ),
    );
  }, []);
  return (
    <div className="box">
      <Form
        onSubmit={handleSubmit}
        initialValues={{}}
        render={({ handleSubmit, form, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit}>
            <div className="field is-grouped">
              <div className="control search is-expanded">
                <Field name="search">
                  {({ input, meta }) => {
                    return (
                      <input
                        {...input}
                        className="input main-search-bar is-medium"
                        placeholder="Type an issue/volume name"
                      />
                    );
                  }}
                </Field>
              </div>
              <div className="control">
                <button className="button is-medium" type="submit">
                  Search
                </button>
              </div>
            </div>
          </form>
        )}
      />
      
    </div>
  );
};

export default SearchBar;
