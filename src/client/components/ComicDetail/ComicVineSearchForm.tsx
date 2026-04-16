import React, { useCallback } from "react";
import { Form, Field } from "react-final-form";
import { ValidationErrors } from "final-form";

interface ComicVineSearchFormProps {
  rawFileDetails?: Record<string, unknown>;
}

interface SearchFormValues {
  issueName?: string;
  issueNumber?: string;
  issueYear?: string;
}

/**
 * Component for performing search against ComicVine
 *
 * @component
 * @example
 * return (
 *   <ComicVineSearchForm data={rawFileDetails} />
 * )
 */
export const ComicVineSearchForm = (props: ComicVineSearchFormProps) => {
  const onSubmit = useCallback((value: SearchFormValues) => {
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
  const validate = (_values: SearchFormValues): ValidationErrors | undefined => {
    return undefined;
  };

  const MyForm = () => (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <label className="block py-1 text-slate-700 dark:text-slate-200">Issue Name</label>
          <Field name="issueName">
            {(props) => (
              <input
                {...props.input}
                className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                placeholder="Type the issue name"
              />
            )}
          </Field>
          <div className="flex flex-row gap-4 mt-2">
            <div>
              <label className="block py-1 text-slate-700 dark:text-slate-200">Number</label>
              <Field name="issueNumber">
                {(props) => (
                  <input
                    {...props.input}
                    className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-14 rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-2 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    placeholder="#"
                  />
                )}
              </Field>
            </div>
            <div>
              <label className="block py-1 text-slate-700 dark:text-slate-200">Year</label>
              <Field name="issueYear">
                {(props) => (
                  <input
                    {...props.input}
                    className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-20 rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-2 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    placeholder="1984"
                  />
                )}
              </Field>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="flex h-10 items-center rounded-lg border border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-600 dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:bg-green-700"
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
