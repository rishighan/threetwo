import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";

export const EditMetadataPanel = (props): ReactElement => {
  const validate = async () => {};
  const onSubmit = async () => {};
  return (
    <>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h2>Metadata</h2>

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Issue Name</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <Field name="issue_name">
                    {(props) => (
                      <p className="control is-expanded has-icons-left">
                        <input
                          className="input"
                          type="text"
                          placeholder="Name"
                        />
                        <span className="icon is-small is-left">
                          <i className="fas fa-user"></i>
                        </span>
                      </p>
                    )}
                  </Field>
                </div>
                <div className="field">
                  <Field name="issue_number">
                    {(props) => (
                      <p className="control is-expanded has-icons-left">
                        <input
                          className="input"
                          type="text"
                          placeholder="Name"
                        />
                        <span className="icon is-small is-left">
                          <i className="fas fa-user"></i>
                        </span>
                      </p>
                    )}
                  </Field>
                </div>
              </div>
            </div>
          </form>
        )}
      />
    </>
  );
};

export default EditMetadataPanel;
