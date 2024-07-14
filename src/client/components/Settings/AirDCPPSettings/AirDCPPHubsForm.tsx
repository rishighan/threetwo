import React, { ReactElement, useState } from "react";
import { Form, Field } from "react-final-form";
import { isEmpty, isNil, isUndefined } from "lodash";
import Select from "react-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { produce } from "immer";
import { AIRDCPP_SERVICE_BASE_URI } from "../../../constants/endpoints";

export const AirDCPPHubsForm = (): ReactElement => {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: async () =>
      await axios({
        url: "http://localhost:3000/api/settings/getAllSettings",
        method: "GET",
      }),
    staleTime: Infinity,
  });

  const { data: hubs } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () =>
      await axios({
        url: `${AIRDCPP_SERVICE_BASE_URI}/getHubs`,
        method: "POST",
        data: {
          host: settings?.data.directConnect?.client?.host,
        },
      }),
    enabled: !isEmpty(settings?.data.directConnect?.client?.host),
  });

  let hubList: any[] = [];
  if (!isNil(hubs)) {
    hubList = hubs?.data.map(({ hub_url, identity }) => ({
      value: hub_url,
      label: identity.name,
    }));
  }

  const mutation = useMutation({
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
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], (oldData: any) =>
        produce(oldData, (draft: any) => {
          draft.data.directConnect.client = {
            ...draft.data.directConnect.client,
            ...data.data.directConnect.client,
          };
        }),
      );
    },
  });

  const validate = async (values) => {
    const errors = {};
    // Add any validation logic here if needed
    return errors;
  };

  const SelectAdapter = ({ input, ...rest }) => {
    return <Select {...input} {...rest} isClearable isMulti />;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading settings.</div>;
  }

  return (
    <>
      {!isEmpty(hubList) && !isUndefined(hubs) ? (
        <Form
          onSubmit={(values) => {
            mutation.mutate(values);
          }}
          validate={validate}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="mt-10">
              <h2 className="text-xl">Configure DC++ Hubs</h2>
              <article
                role="alert"
                className="mt-4 rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
              >
                <h6 className="subtitle has-text-grey-light">
                  Select the hubs you want to perform searches against. Your
                  selection in the dropdown <strong>will replace</strong> the
                  existing selection.
                </h6>
              </article>

              <div className="field">
                <label className="block py-1 mt-3">AirDC++ Host</label>
                <Field
                  name="hubs"
                  component={SelectAdapter}
                  className="basic-multi-select"
                  placeholder="Select Hubs to Search Against"
                  options={hubList}
                />
              </div>
              <button
                type="submit"
                className="flex space-x-1 sm:mt-5 sm:flex-row sm:items-center rounded-lg border border-green-400 dark:border-green-200 bg-green-200 px-4 py-2 text-gray-500 hover:bg-transparent hover:text-green-600 focus:outline-none focus:ring active:text-indigo-500"
              >
                Submit
              </button>
            </form>
          )}
        />
      ) : (
        <article
          role="alert"
          className="mt-4 rounded-lg max-w-screen-md border-s-4 border-yellow-500 bg-yellow-50 p-4 dark:border-s-4 dark:border-yellow-600 dark:bg-yellow-300 dark:text-slate-600"
        >
          <div className="message-body">
            No configured hubs detected in AirDC++. <br />
            Configure to a hub in AirDC++ and then select a default hub here.
          </div>
        </article>
      )}
      {!isEmpty(settings?.data.directConnect?.client.hubs) ? (
        <>
          <div className="mt-4">
            <article className="message is-warning">
              <div className="message-body is-size-6 is-family-secondary"></div>
            </article>
          </div>
          <div>
            <span className="flex items-center mt-10 mb-4">
              <span className="text-xl text-slate-500 dark:text-slate-200 pr-5">
                Default Hub for Searches
              </span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-400"></span>
            </span>
            <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-slate-400 dark:border-gray-700">
              {settings?.data.directConnect?.client.hubs.map(
                ({ value, label }) => (
                  <div key={value}>
                    <div>{label}</div>
                    <span className="is-size-7">{value}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default AirDCPPHubsForm;
