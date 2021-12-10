import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
export const EditMetadataPanel = (props): ReactElement => {
  const validate = async () => {};
  const onSubmit = async () => {};
  const DayPickerAdapter = ({ input, ...rest }) => {
    return <DatePicker {...input} {...rest} />;
  };
  return (
    <>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {/* Issue Name */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Issue Details</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name="issue_name"
                      component="input"
                      className="input"
                      placeholder="Issue Name"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-user-ninja"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Issue Number and year */}
            <div className="field is-horizontal">
              <div className="field-label"></div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field">
                    <p className="control">
                      <Field
                        name="issue_number"
                        component="input"
                        className="input"
                        placeholder="Issue Number"
                      />
                    </p>
                  </div>
                  <p className="help">Do not enter the first zero</p>
                </div>
                {/* year */}
                <div className="field">
                  <p className="control">
                    <Field
                      name="issue_year"
                      component={DayPickerAdapter}
                      className="input"
                      placeholder="Issue Year"
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Story title */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Story</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name="story_title"
                      component="input"
                      className="input"
                      placeholder="Story Title"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-user-ninja"></i>
                    </span>
                  </p>
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
