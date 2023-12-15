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

            <div className="relative flex flex-col">
              <label className="block py-1">Hostname</label>
              <Field name="hostname" validate={hostNameValidator}>
                {({ input, meta }) => (
                  <div className="flex items-center rounded-md border border-gray-300">
                    <div className="relative">
                      <Field
                        name="protocol"
                        component="select"
                        className="appearance-none h-10 bg-transparent rounded-none border-r border-gray-300 text-gray-700 dark:text-slate-200 py-1 pr-6 pl-4 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      >
                        <option>Protocol</option>
                        <option value="http">http://</option>
                        <option value="https">https://</option>
                      </Field>
                      <div className="absolute right-1 inset-y-0 flex items-center px-0 pointer-events-none">
                        <i className="icon-[solar--alt-arrow-down-bold]" />
                      </div>
                    </div>

                    <Field name="hostname" validate={hostNameValidator}>
                      {({ input, meta }) => (
                        <div>
                          <input
                            {...input}
                            type="text"
                            placeholder="Hostname"
                            className="ml-2 bg-transparent py-2 px-2 border-r border-gray-300 w-full h-10 dark:text-slate-200 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                          />
                          {meta.error && meta.touched && (
                            <span className="is-size-7 has-text-danger">
                              {meta.error}
                            </span>
                          )}
                        </div>
                      )}
                    </Field>

                    {/* port */}
                    <Field
                      name="port"
                      component="input"
                      className="ml-2 bg-transparent py-2 px-2 block w-full rounded-md sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      placeholder="Port"
                    />

                    {meta.error && meta.touched && (
                      <span className="text-red-200">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
            </div>

            <label className="block py-1">Credentials</label>
            <div className="flex items-center rounded-md border border-gray-300">
              <div className="relative">
                <Field
                  name="username"
                  component="input"
                  className="relative left-7 top-0 h-10 bg-transparent rounded-none border-r border-gray-300 text-gray-700 dark:text-slate-200 py-1 px-3 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  placeholder="Username"
                />
                <span className="absolute h-6 w-6 left-2 top-2 inset-y-0 flex items-center px-0 pointer-events-none">
                  <i className="icon-[solar--user-bold-duotone] h-6 w-6 dark:text-slate-200" />
                </span>
              </div>
              <div className="relative">
                <Field
                  name="password"
                  component="input"
                  type="password"
                  className="relative left-14 top-0 h-10 bg-transparent text-gray-700 dark:text-slate-200 py-1 px-3 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  placeholder="Password"
                />
                <span className="absolute left-9 top-2 inset-y-0 flex items-center px-0 pointer-events-none h-6 w-6">
                  <i className="icon-[solar--lock-password-bold-duotone] h-6 w-6 dark:text-slate-200" />
                </span>
              </div>
            </div>
            <div className="field is-grouped">
              <button
                className="flex space-x-1 sm:mt-5 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-5 py-3 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                type="submit"
              >
                <span className="text-md">
                  {!isEmpty(initialData) ? "Update" : "Save"}
                </span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--diskette-bold-duotone]"></i>
                </span>
              </button>

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
