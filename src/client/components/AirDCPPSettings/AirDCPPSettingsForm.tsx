import React, { ReactElement, useCallback, useContext, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch } from "react-redux";
import { saveSettings, deleteSettings } from "../../actions/settings.actions";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import axios from "axios";
import { AirDCPPSocketContext } from "../../context/AirDCPPSocket";
import AirDCPPSocket from "../../services/DcppSearchService";
import { isUndefined, isEmpty } from "lodash";

export const AirDCPPSettingsForm = (airDCPPClientSettings): ReactElement => {
  const { settings } = airDCPPClientSettings;
  const dispatch = useDispatch();
  const { setADCPPSocket } = useContext(AirDCPPSocketContext);

  const onSubmit = async (values) => {
    try {
      const airDCPPResponse = await axios({
        url: `${values.protocol}://${values.hostname}/api/v1/sessions/authorize`,
        method: "POST",
        data: {
          username: values.username,
          password: values.password,
        },
      });
      if (airDCPPResponse.status === 200) {
        dispatch(
          saveSettings({
            host: values,
            airDCPPUserSettings: airDCPPResponse.data,
          }),
        );
        setADCPPSocket(
          new AirDCPPSocket({
            hostname: `${values.hostname}`,
          }),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeSettings = useCallback(async () => {
    dispatch(deleteSettings());
    setADCPPSocket({});
  }, []);

  const validate = async () => {};
  const initFormData =
    !isEmpty(settings.directConnect) || !isUndefined(settings.directConnect)
      ? settings.directConnect.client.host
      : {};
  return (
    <>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        initialValues={initFormData}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h2>AirDC++ Connection Information</h2>
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
              <p className="control is-expanded">
                <Field
                  name="hostname"
                  component="input"
                  className="input"
                  placeholder="AirDC++ host IP / hostname"
                />
              </p>
            </div>
            <div className="field">
              <div className="is-clearfix">
                <label className="label">Credentials</label>
              </div>
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
                    <span className="icon is-small is-right">
                      <i className="fas fa-check"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-grouped">
              <p className="control">
                <button type="submit" className="button is-primary">
                  {!isEmpty(initFormData) ? "Update" : "Save"}
                </button>
              </p>
            </div>
          </form>
        )}
      />
      {!isEmpty(settings) ? (
        <AirDCPPSettingsConfirmation settings={settings} />
      ) : null}

      {!isEmpty(settings) ? (
        <p className="control mt-4">
          <button className="button is-danger" onClick={removeSettings}>
            Delete
          </button>
        </p>
      ) : null}
    </>
  );
};

export default AirDCPPSettingsForm;