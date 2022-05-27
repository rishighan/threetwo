import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import DatePicker from "react-datepicker";
import AsyncSelectPaginate from "./AsyncSelectPaginate/AsyncSelectPaginate";
import TextareaAutosize from "react-textarea-autosize";

import "react-datepicker/dist/react-datepicker.css";
export const EditMetadataPanel = (props): ReactElement => {
  const validate = async () => {};
  const onSubmit = async () => {};
  const DayPickerAdapter = ({ input, ...rest }) => {
    return <DatePicker {...input} {...rest} placeholderText={"Cover Date"} />;
  };
  const AsyncSelectPaginateAdapter = ({ input, ...rest }) => {
    return (
      <AsyncSelectPaginate
        {...input}
        {...rest}
        onChange={(value) => input.onChange(value)}
      />
    );
  };
  const TextareaAutosizeAdapter = ({ input, ...rest }) => {
    return (
      <TextareaAutosize
        {...input}
        {...rest}
        onChange={(value) => input.onChange(value)}
      />
    );
  };
  const rawFileDetails = useSelector(
    (state: RootState) => state.comicInfo.comicBookDetail.rawFileDetails.name,
  );
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
                      initialValue={rawFileDetails}
                      placeholder={"Issue Name"}
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
                <div className="field">
                  <p className="control has-icons-left">
                    <Field
                      name="issue_number"
                      component="input"
                      className="input"
                      placeholder="Issue Number"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-hashtag"></i>
                    </span>
                  </p>
                  <p className="help">Do not enter the first zero</p>
                </div>
                {/* year */}
                <div className="field">
                  <p className="control">
                    <Field
                      name="issue_year"
                      component={DayPickerAdapter}
                      className="input"
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* page count */}
            <div className="field is-horizontal">
              <div className="field-label"></div>
              <div className="field-body">
                <div className="field">
                  <p className="control has-icons-left">
                    <Field
                      name="page_count"
                      component="input"
                      className="input"
                      placeholder="Page Count"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-note-sticky"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Description</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name={"description"}
                      className="textarea"
                      component={TextareaAutosizeAdapter}
                      placeholder={"Description"}
                    />
                  </p>
                </div>
              </div>
            </div>

            <hr size="1" />

            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">Distributor Info</label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field">
                    <p className="control has-icons-left">
                      <Field
                        name="distributor_sku"
                        component="input"
                        className="input"
                        placeholder="SKU"
                      />
                      <span className="icon is-small is-left">
                        <i className="fa-solid fa-barcode"></i>
                      </span>
                    </p>
                  </div>
                </div>

                {/* UPC code */}
                <div className="field">
                  <p className="control has-icons-left">
                    <Field
                      name="upc_code"
                      component="input"
                      className="input"
                      placeholder="UPC Code"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-box"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <hr size="1" />

            {/* Publisher */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Publisher</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name={"publisher"}
                      component={AsyncSelectPaginateAdapter}
                      placeholder={
                        <div>
                          <i className="fas fa-print mr-2"></i> Publisher
                        </div>
                      }
                      metronResource={"publisher"}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Arc */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Story Arc</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name={"story_arc"}
                      component={AsyncSelectPaginateAdapter}
                      placeholder={
                        <div>
                          <i className="fas fa-book-open mr-2"></i> Story Arc
                        </div>
                      }
                      metronResource={"arc"}
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
                    <Field
                      name={"series"}
                      component={AsyncSelectPaginateAdapter}
                      placeholder={
                        <div>
                          <i className="fas fa-layer-group mr-2"></i> Series
                        </div>
                      }
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
                          <Field
                            name={`${name}.creator`}
                            component={AsyncSelectPaginateAdapter}
                            placeholder={
                              <div>
                                <i className="fa-solid fa-ghost"></i> Creator
                              </div>
                            }
                            metronResource={"creator"}
                          />
                        </p>
                      </div>

                      <div className="field">
                        <p className="control">
                          <Field
                            name={`${name}.role`}
                            metronResource={"role"}
                            placeholder={
                              <div>
                                <i className="fa-solid fa-key"></i> Role
                              </div>
                            }
                            component={AsyncSelectPaginateAdapter}
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
            <pre>{JSON.stringify(values, undefined, 2)}</pre>
          </form>
        )}
      />
    </>
  );
};

export default EditMetadataPanel;
