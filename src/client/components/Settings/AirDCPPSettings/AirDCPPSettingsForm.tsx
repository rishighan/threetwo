import React, { useState, useEffect } from "react";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AIRDCPP_SERVICE_BASE_URI,
  SETTINGS_SERVICE_BASE_URI,
} from "../../../constants/endpoints";

export const AirDCPPSettingsForm = () => {
  const [airDCPPSessionInformation, setAirDCPPSessionInformation] =
    useState(null);
  // Fetching all settings
  const { data: settingsData, isSuccess: settingsSuccess } = useQuery({
    queryKey: ["airDCPPSettings"],
    queryFn: () => axios.get(`${SETTINGS_SERVICE_BASE_URI}/getAllSettings`),
  });

  // Fetch session information
  const fetchSessionInfo = (host) => {
    return axios.post(`${AIRDCPP_SERVICE_BASE_URI}/initialize`, { host });
  };

  // Use effect to trigger side effects on settings fetch success
  useEffect(() => {
    if (settingsSuccess && settingsData?.data?.directConnect?.client?.host) {
      const host = settingsData.data.directConnect.client.host;
      fetchSessionInfo(host).then((response) => {
        setAirDCPPSessionInformation(response.data);
      });
    }
  }, [settingsSuccess, settingsData]);

  // Handle setting update and subsequent AirDC++ initialization
  const { mutate } = useMutation({
    mutationFn: (values) => {
      console.log(values);
      return axios.post("http://localhost:3000/api/settings/saveSettings", {
        settingsPayload: values,
        settingsKey: "directConnect",
      });
    },
    onSuccess: async (response) => {
      const host = response?.data?.directConnect?.client?.host;
      if (host) {
        const response = await fetchSessionInfo(host);
        setAirDCPPSessionInformation(response.data);
        // setState({ airDCPPClientConfiguration: host });
      }
    },
  });

  const deleteSettingsMutation = useMutation(() =>
    axios.post("http://localhost:3000/api/settings/saveSettings", {
      settingsPayload: {},
      settingsKey: "directConnect",
    }),
  );

  const initFormData = settingsData?.data?.directConnect?.client?.host ?? {};

  return (
    <>
      <ConnectionForm
        initialData={initFormData}
        submitHandler={mutate}
        formHeading={"Configure AirDC++"}
      />

      {airDCPPSessionInformation && (
        <AirDCPPSettingsConfirmation settings={airDCPPSessionInformation} />
      )}

      {settingsData?.data && (
        <p className="control mt-4">
          <button
            className="button is-danger"
            onClick={() => deleteSettingsMutation.mutate()}
          >
            Delete
          </button>
        </p>
      )}
    </>
  );
};

export default AirDCPPSettingsForm;
