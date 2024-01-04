import React, { useCallback } from "react";
import { Form, Field } from "react-final-form";
import Collapsible from "react-collapsible";
import { fetchComicVineMatches } from "../../actions/fileops.actions";

/**
 * Component for performing search against ComicVine
 *
 * @component
 * @example
 * return (
 *   <ComicVineSearchForm data={rawFileDetails} />
 * )
 */
export const ComicVineSearchForm = (data) => {
  const onSubmit = useCallback((value) => {
    const userInititatedQuery = {
      inferredIssueDetails: {
        name: value.issueName,
        number: value.issueNumber,
        subtitle: "",
        year: value.issueYear,
      },
    };
    // dispatch(fetchComicVineMatches(data, userInititatedQuery));
  }, []);
  const validate = () => {
    return true;
  };

  const MyForm = () => (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <span className="flex items-center">
            <span className="text-md text-slate-500 dark:text-slate-500 pr-5">
              Override Search Query
            </span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
          </span>
          <label className="block py-1">Issue Name</label>
          <Field name="issueName">
            {(props) => (
              <input
                {...props.input}
                className="appearance-none dark:bg-slate-400 bg-slate-100 h-10 w-full rounded-md border-none text-gray-700 dark:text-slate-200 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                placeholder="Type the issue name"
              />
            )}
          </Field>
          <div className="flex flex-row gap-4">
            <div>
              <label className="block py-1">Number</label>
              <Field name="issueNumber">
                {(props) => (
                  <input
                    {...props.input}
                    className="appearance-none dark:bg-slate-400 bg-slate-100 h-10 w-14 rounded-md border-none text-gray-700 dark:text-slate-200 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                    placeholder="Type the issue number"
                  />
                )}
              </Field>
            </div>
            <div>
              <label className="block py-1">Year</label>
              <Field name="issueYear">
                {(props) => (
                  <input
                    {...props.input}
                    className="appearance-none dark:bg-slate-400 bg-slate-100 h-10 w-20 rounded-md border-none text-gray-700 dark:text-slate-200 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                    placeholder="Type the issue year"
                  />
                )}
              </Field>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="submit"
                className="flex h-10 sm:mt-3 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-4 py-2 text-gray-500 hover:bg-transparent hover:text-red-600 focus:outline-none focus:ring active:text-indigo-500"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      )}
    />
  );

  return <MyForm />;
};

export default ComicVineSearchForm;
