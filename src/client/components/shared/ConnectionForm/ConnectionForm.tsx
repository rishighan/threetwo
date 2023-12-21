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
          <form onSubmit={handleSubmit} className="mt-10">
            <h2 className="text-xl">{formHeading}</h2>
            <article
              role="alert"
              className="mt-4 rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
            >
              <div>
                <p>Configure your AirDC++ client connection here.</p>
                <p>
                  Note that you need an instance of AirDC++ already running to
                  use this form to connect to it.
                </p>
                <p>
                  See{" "}
                  <a
                    className="underline"
                    href="http://airdcpp.net/docs/installation/installation.html"
                  >
                    here
                  </a>{" "}
                  for AirDC++ installation instructions for various platforms.
                </p>
              </div>
            </article>

            <span className="flex items-center mt-6">
              <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
                Configure Connection
              </span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
            </span>

            <div className="flex flex-row mt-4">
              <div className="relative">
                {/* protocol */}
                <label className="block py-1">Protocol</label>
                <Field
                  name="protocol"
                  component="select"
                  className="appearance-none dark:bg-slate-400 bg-slate-100 h-10 rounded-md border-none text-gray-700 dark:text-slate-200 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                >
                  <option>Protocol</option>
                  <option value="http">http://</option>
                  <option value="https">https://</option>
                </Field>
                <div className="absolute h-7 w-7 right-0 px-1 top-11 pointer-events-none">
                  <i className="icon-[solar--alt-arrow-down-bold]" />
                </div>
              </div>
              {/* hostname */}
              <Field name="hostname" validate={hostNameValidator}>
                {({ input, meta }) => (
                  <div className="flex flex-col">
                    <label className="block px-2 py-1">Hostname</label>
                    <input
                      {...input}
                      type="text"
                      placeholder="Hostname"
                      className="ml-2 dark:bg-slate-400 bg-slate-100 py-2 px-2 rounded-md border-gray-300 h-10 dark:text-slate-200 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                    />
                    <div>
                      {meta.error && meta.touched && (
                        <span className="text-sm text-red-400 px-2">
                          {meta.error}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Field>

              {/* port */}
              <div className="flex flex-col">
                <label className="block px-2 py-1">Port</label>
                <Field
                  name="port"
                  component="input"
                  className="ml-2 dark:bg-slate-400 bg-slate-100 px-2 block h-10 rounded-md sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                  placeholder="Port"
                />
              </div>
            </div>

            <div className="flex flex-row mt-5">
              <div>
                <label className="block py-1">Username</label>
                <div className="relative">
                  <Field
                    name="username"
                    component="input"
                    className="h-10 dark:bg-slate-500 bg-slate-200 rounded-md text-gray-700 dark:text-slate-200 py-1 px-10 mr-5 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                    placeholder="Username"
                  />
                  <span className="absolute h-6 w-6 left-2 top-2 inset-y-0 flex items-center px-0 pointer-events-none">
                    <i className="icon-[solar--user-bold-duotone] h-6 w-6 dark:text-slate-200" />
                  </span>
                </div>
              </div>
              <div>
                <div>
                  <label className="block py-1">Password</label>
                  <div className="relative">
                    <Field
                      name="password"
                      component="input"
                      type="password"
                      className="h-10 dark:bg-slate-500 bg-slate-200 rounded-md text-gray-700 dark:text-slate-200 py-1 px-10 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                      placeholder="Password"
                    />
                    <span className="absolute left-2 top-2 inset-y-0 flex items-center px-0 pointer-events-none h-6 w-6">
                      <i className="icon-[solar--lock-password-bold-duotone] h-6 w-6 dark:text-slate-200" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <button
                className="flex space-x-1 sm:mt-5 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-4 py-2 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                type="submit"
              >
                <span className="text-md">
                  {!isEmpty(initialData) ? "Update" : "Save"}
                </span>
                <span className="w-6 h-6">
                  <i className="h-6 w-6 icon-[solar--diskette-bold-duotone]"></i>
                </span>
              </button>

              <button
                type="submit"
                className="flex space-x-1 sm:mt-5 sm:flex-row sm:items-center rounded-lg border border-red-400 dark:border-red-200 bg-red-200 px-4 py-2 text-gray-500 hover:bg-transparent hover:text-red-600 focus:outline-none focus:ring active:text-indigo-500"
              >
                {!isEmpty(initialData) && "Delete"}
              </button>
            </div>
          </form>
        )}
      />
    </>
  );
};
