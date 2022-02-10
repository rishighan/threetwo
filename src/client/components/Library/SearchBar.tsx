import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import { Form, Field } from "react-final-form";
import { Link } from "react-router-dom";

export const SearchBar = (): ReactElement => {
  const foo = () => {};
  return (
    <div className="box sticky">
      <Form
        onSubmit={foo}
        initialValues={{}}
        render={({ handleSubmit, form, submitting, pristine, values }) => (
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
          </div>
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
