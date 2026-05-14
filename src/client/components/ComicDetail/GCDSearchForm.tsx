import React, { useCallback } from "react";
import { Form, Field } from "react-final-form";
import { ValidationErrors } from "final-form";

export interface GCDSearchFormValues {
  issueName?: string;
  issueNumber?: string;
  issueYear?: string;
}

interface GCDSearchFormProps {
  rawFileDetails?: Record<string, unknown>;
  onSearch?: (values: GCDSearchFormValues) => void;
}

/**
 * Component for performing manual search against GCD (Grand Comics Database).
 * Allows users to override the auto-inferred search parameters
 * with custom series name, issue number, and year values.
 *
 * @component
 * @example
 * return (
 *   <GCDSearchForm rawFileDetails={rawFileDetails} onSearch={handleSearch} />
 * )
 */
export const GCDSearchForm = (props: GCDSearchFormProps) => {
  const { onSearch } = props;

  const onSubmit = useCallback(
    (value: GCDSearchFormValues) => {
      if (onSearch) {
        onSearch(value);
      }
    },
    [onSearch]
  );

  const validate = (_values: GCDSearchFormValues): ValidationErrors | undefined => {
    return undefined;
  };

  const MyForm = () => (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <label className="block py-1 text-slate-700 dark:text-slate-200">
            Series Name
          </label>
          <Field name="issueName">
            {(props) => (
              <input
                {...props.input}
                className="appearance-none bg-slate-100 dark:bg-slate-700 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 py-1 pr-7 pl-3 sm:text-md sm:leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                placeholder="Type the series name"
              />
            )}
          </Field>
          <div className="flex flex-row gap-4 mt-2">
            <div>
              <label className="block py-1 text-slate-700 dark:text-slate-200">
                Issue Number
              </label>
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
              <label className="block py-1 text-slate-700 dark:text-slate-200">
                Year
              </label>
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
                <span className="pr-1">
                  <i className="icon-[solar--database-bold-duotone] w-4 h-4"></i>
                </span>
                Search GCD
              </button>
            </div>
          </div>
        </form>
      )}
    />
  );

  return <MyForm />;
};

export default GCDSearchForm;
