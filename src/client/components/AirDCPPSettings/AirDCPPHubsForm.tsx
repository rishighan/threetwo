import React, { ReactElement, useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import axios from "axios";
import { useDispatch } from "react-redux";
import { isEmpty, isUndefined } from "lodash";
import Select from "react-select";
import { saveSettings } from "../../actions/settings.actions";
import { CORS_PROXY_SERVER_URI } from "../../constants/endpoints";

export const AirDCPPHubsForm = (airDCPPClientUserSettings): ReactElement => {
  const { settings } = airDCPPClientUserSettings;
  const dispatch = useDispatch();
  const [hubList, setHubList] = useState([]);

  useEffect(() => {
    if (!isEmpty(settings)) {
      axios({
        url: `${CORS_PROXY_SERVER_URI}${settings.directConnect.client.host.protocol}://${settings.directConnect.client.host.hostname}/api/v1/hubs`,
        method: "GET",
        headers: {
          Authorization: `${settings.directConnect.client.airDCPPUserSettings.auth_token}`,
        },
      }).then((hubs) => {
        const hubSelectionOptions = hubs.data.map(({ hub_url, identity }) => ({
          value: hub_url,
          label: identity.name,
        }));

        setHubList(hubSelectionOptions);
      });
    }
  }, []);

  const onSubmit = (values) => {
    if (!isUndefined(values.hubs)) {
      dispatch(saveSettings({ hubs: values.hubs }, settings._id));
    }
  };

  const validate = async () => {};

  const SelectAdapter = ({ input, ...rest }) => {
    return <Select {...input} {...rest} isClearable isMulti />;
  };

  return (
    <>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div>
              <h3 className="title">Hubs</h3>
              <h6 className="subtitle has-text-grey-light">
                Select the hubs you want to perform searches against.
              </h6>
            </div>
            <div className="field">
              <label className="label">AirDC++ Host</label>
              <div className="control">
                <Field
                  name="hubs"
                  component={SelectAdapter}
                  className="basic-multi-select"
                  placeholder="Select Hubs to Search Against"
                  options={hubList}
                />
              </div>
            </div>

            <button type="submit" className="button is-primary">
              Submit
            </button>
          </form>
        )}
      />
      <div className="mt-4">
        <article className="message is-warning">
          <div className="message-body is-size-6 is-family-secondary">
            Your selection in the dropdown <strong>will replace</strong> the
            existing selection.
          </div>
        </article>
      </div>
      <div className="box mt-3">
        <h6>Selected hubs</h6>
        {settings.directConnect.client.hubs.map(({ value, label }) => (
          <div key={value}>
            <div>{label}</div>
            <span className="is-size-7">{value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default AirDCPPHubsForm;
