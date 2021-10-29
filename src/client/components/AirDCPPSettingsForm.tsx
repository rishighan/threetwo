import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";

export const AirDCPPSettingsForm = (): ReactElement => {
  const onSubmit = () => {};
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

          <button type="submit" className="button is-primary">Submit</button>
        </form>
      )}
    />
  );
};

export default AirDCPPSettingsForm;
