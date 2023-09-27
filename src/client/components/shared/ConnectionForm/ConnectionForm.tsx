import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";
import { hostNameValidator } from "../../../shared/utils/validator.utils";
import { isEmpty } from "lodash";

export const ConnectionForm = ({
  initialData,
  submitHandler,
}): ReactElement => {
  return (
    <>
      <Form
        onSubmit={submitHandler}
        initialValues={initialData}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h2>Configure AirDC++</h2>
            <label className="label">AirDC++ Hostname</label>
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
            </div>
          </form>
        )}
      />
    </>
  );
};
