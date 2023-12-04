import React, { ReactElement, useEffect, useState, useContext } from "react";
import { Form, Field } from "react-final-form";
import { isEmpty, isNil, isUndefined } from "lodash";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store";
import axios from "axios";

export const AirDCPPHubsForm = (): ReactElement => {
  const queryClient = useQueryClient();
  const {
    airDCPPSocketInstance,
    airDCPPClientConfiguration,
    airDCPPSessionInformation,
  } = useStore((state) => ({
    airDCPPSocketInstance: state.airDCPPSocketInstance,
    airDCPPClientConfiguration: state.airDCPPClientConfiguration,
    airDCPPSessionInformation: state.airDCPPSessionInformation,
  }));

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
  });

  /**
   * Get the hubs list from an AirDCPP Socket
   */
  const { data: hubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => await airDCPPSocketInstance.get(`hubs`),
  });
  let hubList = {};
  if (!isNil(hubs)) {
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
        data: {
          settingsPayload: values,
          settingsObjectId: settings?.data._id,
          settingsKey: "directConnect",
        },
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
      {!isEmpty(hubList) && !isUndefined(hubs) ? (
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
      ) : (
        <>
          <article className="message">
            <div className="message-body">
              No configured hubs detected in AirDC++. <br />
              Configure to a hub in AirDC++ and then select a default hub here.
            </div>
          </article>
        </>
      )}
      {!isEmpty(settings?.data.directConnect?.client.hubs) ? (
        <>
          <div className="mt-4">
            <article className="message is-warning">
              <div className="message-body is-size-6 is-family-secondary">
                Your selection in the dropdown <strong>will replace</strong> the
                existing selection.
              </div>
            </article>
          </div>
          <div className="box mt-3">
            <h6>Default Hub For Searches:</h6>
            {settings?.data.directConnect?.client.hubs.map(
              ({ value, label }) => (
                <div key={value}>
                  <div>{label}</div>
                  <span className="is-size-7">{value}</span>
                </div>
              ),
            )}
          </div>
        </>
      ) : null}
    </>
  );
};

export default AirDCPPHubsForm;
