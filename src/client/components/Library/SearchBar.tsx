import React, { ReactElement, useCallback } from "react";
import PropTypes from "prop-types";
import { Form, Field } from "react-final-form";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";

export const SearchBar = (): ReactElement => {
  const dispatch = useDispatch();
  const handleSubmit = useCallback((e) => {
    console.log(e);
    dispatch(
      searchIssue({
        queryObject: {
          volumeName: e.search,
        },
      }),
    );
  }, []);
  return (
    <div className="box sticky">
      <Form
        onSubmit={handleSubmit}
        initialValues={{}}
        render={({ handleSubmit, form, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit}>
            <div className="column is-three-quarters search">
              <label>Search</label>
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
              <button className="button" type="submit">
                Search
              </button>
            </div>
          </form>
        )}
      />
      <div className="column one-fifth">
        <div className="field has-addons">
          <p className="control">
            <button className="button">
              <span className="icon is-small">
                <i className="fa-solid fa-list"></i>
              </span>
            </button>
          </p>
          <p className="control">
            <button className="button">
              <Link to="/library-grid">
                <span className="icon is-small">
                  <i className="fa-solid fa-image"></i>
                </span>
              </Link>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
