import React from "react";
import { Form, Field } from "react-final-form";
import Collapsible from "react-collapsible";

/**
 * Component for accepting ComicVine search parameters
 *
 * @component
 * @example
 * const age = 21
 * const name = 'Jitendra Nirnejak'
 * return (
 *   <User age={age} name={name} />
 * )
 */
export const ComicVineSearchForm = () => {
  const onSubmit = () => {
    return true;
  };
  const validate = () => {
    return true;
  };

  const MyForm = () => (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <span className="field is-normal">
            <label className="label">Issue Details</label>
          </span>
          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
                <Field name="issueName">
                  {(props) => (
                    <p className="control is-expanded has-icons-left">
                      <input
                        {...props.input}
                        className="input is-normal"
                        placeholder="Type the issue name"
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-journal-whills"></i>
                      </span>
                    </p>
                  )}
                </Field>
              </div>

              <div className="field">
                <Field name="issueNumber">
                  {(props) => (
                    <p className="control is-expanded has-icons-left">
                      <input
                        {...props.input}
                        className="input is-normal"
                        placeholder="Type the issue number"
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-hashtag"></i>
                      </span>
                    </p>
                  )}
                </Field>
              </div>
            </div>
          </div>
          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-info is-light is-outlined is-small"
                  >
                    <span className="icon">
                      <i className="fas fa-hand-sparkles"></i>
                    </span>
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    />
  );

  return (
    <Collapsible
      trigger={"Match Manually"}
      triggerTagName="a"
      triggerClassName={"is-size-6"}
      triggerOpenedClassName={"is-size-6"}
    >
      <MyForm />
    </Collapsible>
  );
};

export default ComicVineSearchForm;
