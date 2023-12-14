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
              <label className="label">Hostname</label>
              <Field name="hostname" validate={hostNameValidator}>
                {({ input, meta }) => (
                  <div className="flex items-center rounded-md border border-gray-300">
                    <div className="relative">
                      <Field
                        name="protocol"
                        component="select"
                        className="appearance-none h-10 bg-transparent rounded-none border-r border-gray-300 text-gray-700 dark:text-slate-200 py-1 px-3 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      >
                        <option>Protocol</option>
                        <option value="http">http://</option>
                        <option value="https">https://</option>
                      </Field>
                      <div className="absolute right-1 inset-y-0 flex items-center px-0 pointer-events-none">
                        <i className="icon-[solar--alt-arrow-down-bold]" />
                      </div>
                    </div>

                    <input
                      {...input}
                      type="text"
                      placeholder="hostname"
                      className="ml-2 bg-transparent py-2 px-2 border-r border-gray-300 w-full h-10 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                    />

                    {/* port */}
                    <Field
                      name="port"
                      component="input"
                      className="ml-2 bg-transparent py-2 px-2 block w-full rounded-md sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      placeholder="port"
                    />

                    {meta.error && meta.touched && (
                      <span className="text-red-200">{meta.error}</span>
                    )}
                  </div>
                )}
              </Field>
            </div>

            <label className="label">Credentials</label>
            <div className="flex items-center rounded-md border border-gray-300">
              <div className="relative">
                <Field
                  name="username"
                  component="input"
                  className="appearance-none h-10 bg-transparent rounded-none border-r border-gray-300 text-gray-700 dark:text-slate-200 py-1 px-3 sm:text-sm sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  placeholder="Username"
                />
                <span className="absolute right-10 inset-y-0 flex items-center px-0 pointer-events-none">
                  <i className="icon-[solar--user-bold-duotone]" />
                </span>
              </div>
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
