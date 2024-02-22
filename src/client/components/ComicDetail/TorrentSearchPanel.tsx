import React, { useCallback, ReactElement, useEffect, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Field } from "react-final-form";

export const TorrentSearchPanel = (props): ReactElement => {
  return (
    <>
      <div className="mt-5">
        <Form
          onSubmit={() => {}}
          initialValues={{}}
          render={({ handleSubmit, form, submitting, pristine, values }) => (
            <form onSubmit={handleSubmit}>
              <Field name="issueName">
                {({ input, meta }) => {
                  return (
                    <div className="max-w-fit">
                      <div className="flex flex-row bg-slate-300 dark:bg-slate-400 rounded-l-lg">
                        <div className="w-10 pl-2 pt-1 text-gray-400 dark:text-gray-200">
                          <i className="icon-[solar--magnifer-bold-duotone] h-7 w-7" />
                        </div>
                        <input
                          {...input}
                          className="dark:bg-slate-400 bg-slate-300 py-2 px-2 rounded-l-md border-gray-300 h-10 min-w-full dark:text-slate-800 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                          placeholder="Enter a search term"
                        />

                        <button
                          className="sm:mt-0 min-w-fit rounded-r-lg border border-green-400 dark:border-green-200 bg-green-200 px-3 py-1 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
                          type="submit"
                        >
                          <div className="flex flex-row">
                            Search Indexer
                            <div className="h-5 w-5 ml-1">
                              <i className="h-6 w-6 icon-[solar--magnet-bold-duotone]" />
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                }}
              </Field>
            </form>
          )}
        />
      </div>
    </>
  );
};

export default TorrentSearchPanel;
