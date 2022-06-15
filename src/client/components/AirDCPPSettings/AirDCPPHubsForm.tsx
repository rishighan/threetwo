import React, { ReactElement, useEffect, useState, useContext } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch } from "react-redux";
import { isEmpty, isNil, isUndefined } from "lodash";
import Select from "react-select";
import { saveSettings } from "../../actions/settings.actions";
import { AirDCPPSocketContext } from "../../context/AirDCPPSocket";

export const AirDCPPHubsForm = (airDCPPClientUserSettings): ReactElement => {
  const dispatch = useDispatch();
  const [hubList, setHubList] = useState([]);
  const airDCPPConfiguration = useContext(AirDCPPSocketContext);
  const { AirDCPPSocket, settings } = airDCPPConfiguration;

  useEffect(() => {
    (async () => {
      if (!isEmpty(settings)) {
        const hubs = await AirDCPPSocket.get(`hubs`);
        const hubSelectionOptions = hubs.map(({ hub_url, identity }) => ({
          value: hub_url,
          label: identity.name,
        }));

        setHubList(hubSelectionOptions);
      }
    })();
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
