import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import AsyncSelectPaginate from "./AsyncSelectPaginate/AsyncSelectPaginate";
import TextareaAutosize from "react-textarea-autosize";

export const EditMetadataPanel = (props): ReactElement => {
  const validate = async () => {};
  const onSubmit = async () => {};

  const { data } = props;

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
  // const rawFileDetails = useSelector(
  //   (state: RootState) => state.comicInfo.comicBookDetail.rawFileDetails.name,
  // );

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
                <Field
                  name="issue_name"
                  component="input"
                  className="appearance-none w-full dark:bg-slate-400 bg-slate-100 h-10 rounded-md border-none text-gray-700 dark:text-slate-200 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  initialValue={data.name}
                  placeholder={"Issue Name"}
                />
              </div>
            </div>
            {/* Issue Number and year */}
            <div className="mt-4 flex flex-row gap-2">
              <div>
                <div className="text-sm">Issue Number</div>
                <Field
                  name="issue_number"
                  component="input"
                  className="dark:bg-slate-400 w-20 bg-slate-100 py-2 px-2 rounded-md border-gray-300 h-10 dark:text-slate-200 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  placeholder="Issue Number"
                />
                <p className="text-xs">Do not enter the first zero</p>
              </div>
              <div>
                {/* year */}
                <div className="text-sm">Issue Year</div>
                <Field
                  name="issue_year"
                  component="input"
                  className="dark:bg-slate-400 w-20 bg-slate-100 py-2 px-2 rounded-md border-gray-300 h-10 dark:text-slate-200 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                />
              </div>

              <div>
                <div className="text-sm">Page Count</div>
                <Field
                  name="page_count"
                  component="input"
                  className="dark:bg-slate-400 w-20 bg-slate-100 py-2 px-2 rounded-md border-gray-300 h-10 dark:text-slate-200 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  placeholder="Page Count"
                />
              </div>
            </div>

            {/* page count */}

            {/* Description */}
            <div className="mt-2">
              <label className="text-sm">Description</label>
              <Field
                name={"description"}
                className="dark:bg-slate-400 w-full min-h-24 bg-slate-100 py-2 px-2 rounded-md border-gray-300 h-10 dark:text-slate-200 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                component={TextareaAutosizeAdapter}
                placeholder={"Description"}
              />
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
