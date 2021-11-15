import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch } from "react-redux";
import { saveSettings } from "../actions/settings.actions";
import axios from "axios";

export const AirDCPPSettingsForm = (): ReactElement => {
  const dispatch = useDispatch();
  const onSubmit = async (values) => {
    try {
      const airdcppResponse = await axios({
        url: `https://${values.airdcpp_hostname}/api/v1/sessions/authorize`,
        method: "POST",
        data: {
          username: values.airdcpp_username,
          password: values.airdcpp_password,
        },
      });
      if (airdcppResponse.status === 200) {
        dispatch(saveSettings(values));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const validate = async () => {};
  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <h2>AirDC++ Connection Information</h2>
          <div className="field">
            <label className="label">AirDC++ Hostname</label>
            <div className="control">
              <Field
                name="airdcpp_hostname"
                component="input"
                className="input"
                placeholder="111.222.333.4 / one.airdcpp.com"
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
