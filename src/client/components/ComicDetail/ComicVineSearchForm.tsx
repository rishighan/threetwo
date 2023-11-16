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
          <span className="field is-normal">
            <label className="label mb-2 is-size-5">Search Manually</label>
          </span>
          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
                <Field name="issueName">
                  {(props) => (
                    <p className="control is-expanded has-icons-left">
                      <input
                        {...props.input}
                        className="input is-normal"
                        placeholder="Type the issue name"
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-journal-whills"></i>
                      </span>
                    </p>
                  )}
                </Field>
              </div>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
                <Field name="issueNumber">
                  {(props) => (
                    <p className="control has-icons-left">
                      <input
                        {...props.input}
                        className="input is-normal"
                        placeholder="Type the issue number"
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-hashtag"></i>
                      </span>
                    </p>
                  )}
                </Field>
              </div>

              <div className="field">
                <Field name="issueYear">
                  {(props) => (
                    <p className="control has-icons-left">
                      <input
                        {...props.input}
                        className="input is-normal"
                        placeholder="Type the issue year"
                      />
                      <span className="icon is-small is-left">
                        <i className="fas fa-hashtag"></i>
                      </span>
                    </p>
                  )}
                </Field>
              </div>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-success is-light is-outlined is-small"
                  >
                    <span className="icon">
                      <i className="fas fa-search"></i>
                    </span>
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    />
  );

  return <MyForm />;
};

export default ComicVineSearchForm;
