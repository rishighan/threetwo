import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import DatePicker from "react-datepicker";
import AsyncSelectPaginate from "./AsyncSelectPaginate/AsyncSelectPaginate";

import "react-datepicker/dist/react-datepicker.css";
export const EditMetadataPanel = (props): ReactElement => {
  const validate = async () => {};
  const onSubmit = async () => {};
  const DayPickerAdapter = ({ input, ...rest }) => {
    return <DatePicker {...input} {...rest} />;
  };
  const dispatch = useDispatch();

  return (
    <>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        mutators={{
          ...arrayMutators,
        }}
        render={({
          handleSubmit,
          form: {
            mutators: { push, pop },
          }, // injected from final-form-arrays above
          pristine,
          form,
          submitting,
          values,
        }) => (
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

            {/* Publisher */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Publisher</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <AsyncSelectPaginate
                      placeholder={"Publisher"}
                      metronResource={"publisher"}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* series */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Series</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <AsyncSelectPaginate
                      placeholder={"Series"}
                      metronResource={"series"}
                    />
                  </p>
                </div>
              </div>
            </div>

            <hr size="1" />

            {/* team credits */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Team Credits</label>
              </div>
              <div className="field-body mt-4">
                <div className="field">
                  <div className="buttons">
                    <button
                      type="button"
                      className="button is-small"
                      onClick={() => push("credits", undefined)}
                    >
                      Add credit
                    </button>
                    <button
                      type="button"
                      className="button is-small"
                      onClick={() => pop("credits")}
                    >
                      Remove credit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <FieldArray name="credits">
              {({ fields }) =>
                fields.map((name, index) => (
                  <div className="field is-horizontal" key={name}>
                    <div className="field-label is-normal">
                      <label></label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <p className="control">
                          <AsyncSelectPaginate
                            placeholder={"Creator"}
                            metronResource={"creator"}
                          />
                        </p>
                      </div>

                      <div className="field">
                        <p className="control">
                          <Field
                            name={`${name}.lastName`}
                            component="input"
                            className="input"
                            placeholder="role"
                          />
                        </p>
                      </div>
                      <span
                        className="icon is-danger mt-2"
                        onClick={() => fields.remove(index)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-times"></i>
                      </span>
                    </div>
                  </div>
                ))
              }
            </FieldArray>
          </form>
        )}
      />
    </>
  );
};

export default EditMetadataPanel;
