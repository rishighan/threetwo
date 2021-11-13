import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";

export const AirDCPPSettingsForm = (): ReactElement => {
  const onSubmit = async (values) => {
    console.log(values);
  };
  const validate = async () => {};

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <h2>Hub Connection Information</h2>
          <div className="field">
            <label className="label">Hub URL</label>
            <div className="control">
              <Field
                name="airdcpp_hostname"
                component="input"
                className="input"
                placeholder="adc://hub.url"
              />
            </div>
          </div>
          <div className="field">
            <div className="is-clearfix">
              <label className="label">Credentials</label>
            </div>
            <div className="field-body">
              <div className="field">
                <p className="control is-expanded has-icons-left">
                  <Field
                    name="airdcpp_username"
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
                    name="airdcpp_password"
                    component="input"
                    type="password"
                    className="input"
                    placeholder="Password"
                  />
                  <span className="icon is-small is-left">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <span className="icon is-small is-right">
                    <i className="fas fa-check"></i>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <button type="submit" className="button is-primary">
            Submit
          </button>
        </form>
      )}
    />
  );
};

export default AirDCPPSettingsForm;
