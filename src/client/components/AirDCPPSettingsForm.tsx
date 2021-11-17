import React, { ReactElement, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { saveSettings, getSettings } from "../actions/settings.actions";
import axios from "axios";
import { isUndefined, isEmpty } from "lodash";

export const AirDCPPSettingsForm = (): ReactElement => {
  const airdcppClientSettings = useSelector(
    (state: RootState) => state.settings.data[0],
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  const onSubmit = async (values) => {
    try {
      const fqdn = values.protocol + values.hostname;
      const airdcppResponse = await axios({
        url: `${fqdn}/api/v1/sessions/authorize`,
        method: "POST",
        data: {
          username: values.username,
          password: values.password,
        },
      });
      if (airdcppResponse.status === 200) {
        dispatch(saveSettings(values, airdcppResponse.data));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const validate = async () => {};
  const initFormData = !isUndefined(airdcppClientSettings)
    ? airdcppClientSettings.directConnect.client
    : null;
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
                    <option value="http://" defaultValue={"http://"}>
                      http://
                    </option>
                    <option value="https://">https://</option>
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

            <button type="submit" className="button is-primary">
              {!isEmpty(initFormData) ? "Update" : "Save"}
            </button>
          </form>
        )}
      />
      {!isUndefined(airdcppClientSettings) &&
      !isEmpty(airdcppClientSettings) ? (
        <div className="mt-4 is-clearfix">
          <div className="card">
            <div className="card-content">
              <span className="icon is-medium is-pulled-right">
                <i className="fa-solid fa-circle has-text-success"></i>
              </span>
              <div className="content is-size-7">
                <dl>
                  <dt>{airdcppClientSettings._id}</dt>
                  <dt>
                    Client version:{" "}
                    {
                      airdcppClientSettings.directConnect.client
                        .airdcppUserSettings.system_info.client_version
                    }
                  </dt>
                  <dt>
                    Hostname:{" "}
                    {
                      airdcppClientSettings.directConnect.client
                        .airdcppUserSettings.system_info.hostname
                    }
                  </dt>
                  <dt>
                    Platform:{" "}
                    {
                      airdcppClientSettings.directConnect.client
                        .airdcppUserSettings.system_info.platform
                    }
                  </dt>

                  <dt>
                    Username:{" "}
                    {
                      airdcppClientSettings.directConnect.client
                        .airdcppUserSettings.user.username
                    }
                  </dt>

                  <dt>
                    Active Sessions:{" "}
                    {
                      airdcppClientSettings.directConnect.client
                        .airdcppUserSettings.user.active_sessions
                    }
                  </dt>
                  <dt>
                    Permissions:{" "}
                    <pre>
                      {JSON.stringify(
                        airdcppClientSettings.directConnect.client
                          .airdcppUserSettings.user.permissions,
                        undefined,
                        2,
                      )}
                    </pre>
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AirDCPPSettingsForm;
