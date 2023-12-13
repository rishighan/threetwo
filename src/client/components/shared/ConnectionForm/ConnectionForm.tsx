import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";
import { hostNameValidator } from "../../../shared/utils/validator.utils";
import { isEmpty } from "lodash";

export const ConnectionForm = ({
  initialData,
  submitHandler,
  formHeading,
}): ReactElement => {
  return (
    <>
      <Form
        onSubmit={submitHandler}
        initialValues={initialData}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl">{formHeading}</h2>

            <div className="relative flex w-full max-w-[24rem]">
              <Field name="hostname" validate={hostNameValidator}>
                {({ input, meta }) => (
                  <div className="flex items-center rounded-md border border-gray-300">
                    <div className="relative">
                      {/* <select
                        id="dropdown"
                        className="appearance-none h-11 bg-transparent rounded-none border-r border-gray-300 text-gray-700 dark:text-slate-200 py-1 px-3 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      >
                        <option>Protocol</option>
                        <option value="http">http://</option>
                        <option value="https">https://</option>
                      </select> */}
                      <Field
                        name="protocol"
                        component="select"
                        className="appearance-none h-11 bg-transparent rounded-none border-r border-gray-300 text-gray-700 dark:text-slate-200 py-1 px-3 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      >
                        <option>Protocol</option>
                        <option value="http">http://</option>
                        <option value="https">https://</option>
                      </Field>
                      <div className="absolute right-0 inset-y-0 flex items-center px-0 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3"></path>
                        </svg>
                      </div>
                    </div>

                    <input
                      {...input}
                      type="text"
                      placeholder="hostname"
                      className="ml-2 bg-transparent py-2 px-2 block w-full rounded-md sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                    />
                    {meta.error && meta.touched && (
                      <span className="is-size-7 has-text-danger">
                        {meta.error}
                      </span>
                    )}
                  </div>
                )}
              </Field>
            </div>
            <label className="label">Hostname</label>
            <div className="field has-addons">
              <p className="control">
                <span className="select">
                  <Field name="protocol" component="select">
                    <option>Protocol</option>
                    <option value="http">http://</option>
                    <option value="https">https://</option>
                  </Field>
                </span>
              </p>
              <div className="control is-expanded">
                <Field name="hostname" validate={hostNameValidator}>
                  {({ input, meta }) => (
                    <div>
                      <input
                        {...input}
                        type="text"
                        placeholder="hostname"
                        className="input"
                      />
                      {meta.error && meta.touched && (
                        <span className="is-size-7 has-text-danger">
                          {meta.error}
                        </span>
                      )}
                    </div>
                  )}
                </Field>
              </div>
              <p className="control">
                <Field
                  name="port"
                  component="input"
                  className="input"
                  placeholder="port"
                />
              </p>
            </div>
            <div className="field">
              <label className="label">Credentials</label>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name="username"
                      component="input"
                      className="input"
                      placeholder="Username"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-user-ninja"></i>
                    </span>
                  </p>
                </div>
                <div className="field">
                  <p className="control is-expanded has-icons-left has-icons-right">
                    <Field
                      name="password"
                      component="input"
                      type="password"
                      className="input"
                      placeholder="Password"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <button type="submit" className="button is-primary">
                  {!isEmpty(initialData) ? "Update" : "Save"}
                </button>
              </p>

              <p className="control">
                <button type="submit" className="button is-danger">
                  {!isEmpty(initialData) && "Delete"}
                </button>
              </p>
            </div>
          </form>
        )}
      />
    </>
  );
};
