import React, { ReactElement, useEffect, useState, useContext } from "react";
import { Form, Field } from "react-final-form";
import { isEmpty, isNil, isUndefined } from "lodash";
import Select from "react-select";
import { saveSettings } from "../../../actions/settings.actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";

export const AirDCPPHubsForm = (airDCPPClientUserSettings): ReactElement => {
  const queryClient = useQueryClient();
  const {
    airDCPPSocketInstance,
    airDCPPClientConfiguration,
    airDCPPSessionInformation,
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketInstance: state.airDCPPSocketInstance,
      airDCPPClientConfiguration: state.airDCPPClientConfiguration,
      airDCPPSessionInformation: state.airDCPPSessionInformation,
    })),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });

  console.log("Asd", data);
  const {
    settings: {
      data: { directConnect },
    },
  } = data;

  const { data: hubs } = useQuery({
    queryKey: [],
    queryFn: async () => await airDCPPSocketInstance.get(`hubs`),
    enabled: !!settings,
  });
  let hubList = {};
  if (hubs) {
    hubList = hubs.map(({ hub_url, identity }) => ({
      value: hub_url,
      label: identity.name,
    }));
  }

  const { mutate } = useMutation({
    mutationFn: async (values) =>
      await axios({
        url: `http://localhost:3000/api/settings/saveSettings`,
        method: "POST",
        data: { settingsPayload: values, settingsKey: "directConnect" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const validate = async () => {};

  const SelectAdapter = ({ input, ...rest }) => {
    return <Select {...input} {...rest} isClearable isMulti />;
  };

  return (
    <>
      <Form
        onSubmit={mutate}
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
        {settings &&
          settings?.directConnect?.client.hubs.map(({ value, label }) => (
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
