import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Field } from "react-final-form";
import DatePicker from "react-datepicker";
import Creatable from "react-select/creatable";
import { fetchMetronResource } from "../../actions/metron.actions";
import { withAsyncPaginate } from "react-select-async-paginate";
const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

import "react-datepicker/dist/react-datepicker.css";
export const EditMetadataPanel = (props): ReactElement => {
  const validate = async () => {};
  const onSubmit = async () => {};
  const DayPickerAdapter = ({ input, ...rest }) => {
    return <DatePicker {...input} {...rest} />;
  };
  const dispatch = useDispatch();
  const [value, onChange] = useState(null);

  const mudasir = useCallback((query) => {
    return fetchMetronResource({
      method: "GET",
      resource: "publisher",
      query: {
        name: query,
        page: 1,
      },
    });
  }, []);

  return (
    <>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {/* Issue Name */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Issue Details</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name="issue_name"
                      component="input"
                      className="input"
                      placeholder="Issue Name"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-user-ninja"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Issue Number and year */}
            <div className="field is-horizontal">
              <div className="field-label"></div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field">
                    <p className="control">
                      <Field
                        name="issue_number"
                        component="input"
                        className="input"
                        placeholder="Issue Number"
                      />
                    </p>
                  </div>
                  <p className="help">Do not enter the first zero</p>
                </div>
                {/* year */}
                <div className="field">
                  <p className="control">
                    <Field
                      name="issue_year"
                      component={DayPickerAdapter}
                      className="input"
                      placeholder="Issue Year"
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Story title */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Story</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name="story_title"
                      component="input"
                      className="input"
                      placeholder="Story Title"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-user-ninja"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Publisher */}
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Publisher</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <CreatableAsyncPaginate
                      SelectComponent={Creatable}
                      debounceTimeout={3}
                      // isDisabled={isAddingInProgress}
                      value={value}
                      loadOptions={(e) => mudasir(e)}
                      // onCreateOption={onCreateOption}
                      onChange={onChange}
                      // cacheUniqs={[cacheUniq]}
                    />
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      />
    </>
  );
};

export default EditMetadataPanel;
