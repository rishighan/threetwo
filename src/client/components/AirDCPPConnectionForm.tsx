import React, { ReactElement } from "react";
import { Form, Field } from "react-final-form";

export const AirDCPPConnectionForm = (): ReactElement => {
  const onSubmit = () => {};
  const validate = async () => {};

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div>
            <h3 className="title">AirDC++ Connection Settings</h3>
            <h6 className="subtitle has-text-grey-light">
              Configure AirDC++ connection settings such as hostname and
              credentials
            </h6>
          </div>
          <div className="field">
            <label className="label">AirDC++ Host</label>
            <div className="control">
              <Field
                name="airdcpp_hostname"
                component="input"
                className="input"
                placeholder="adc://hub.url"
              />
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

export default AirDCPPConnectionForm;
