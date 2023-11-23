import React, { ReactElement, useCallback } from "react";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import { isUndefined, isEmpty } from "lodash";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { initializeAirDCPPSocket, useStore } from "../../../store/index";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const AirDCPPSettingsForm = (): ReactElement => {
  // cherry-picking selectors for:
  // 1. initial values for the form
  // 2. If initial values are present, get the socket information to display
  const { setState } = useStore;
  const {
    airDCPPSocketConnected,
    airDCPPDisconnectionInfo,
    airDCPPSessionInformation,
    airDCPPClientConfiguration,
    airDCPPSocketInstance,
    setAirDCPPSocketInstance,
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketConnected: state.airDCPPSocketConnected,
      airDCPPDisconnectionInfo: state.airDCPPDisconnectionInfo,
      airDCPPClientConfiguration: state.airDCPPClientConfiguration,
      airDCPPSessionInformation: state.airDCPPSessionInformation,
      airDCPPSocketInstance: state.airDCPPSocketInstance,
      setAirDCPPSocketInstance: state.setAirDCPPSocketInstance,
    })),
  );

  /**
   * Mutation to update settings and subsequently initialize
   * AirDC++ socket with those settings
   */
  const { mutate } = useMutation({
    mutationFn: async (values) =>
      await axios({
        url: `http://localhost:3000/api/settings/saveSettings`,
        method: "POST",
        data: { settingsPayload: values, settingsKey: "directConnect" },
      }),
    onSuccess: async (values) => {
      const {
        data: {
          directConnect: {
            client: { host },
          },
        },
      } = values;
      const dcppSocketInstance = await initializeAirDCPPSocket(host);
      console.log("jogiya", dcppSocketInstance);
      setState({ airDCPPSocketInstance: dcppSocketInstance });
    },
  });
  const deleteSettingsMutation = useMutation(
    async () =>
      await axios.post("http://localhost:3000/api/settings/saveSettings", {
        settingsPayload: {},
        settingsKey: "directConnect",
      }),
  );

  // const removeSettings = useCallback(async () => {
  //   // airDCPPSettings.setSettings({});
  // }, []);
  //
  const initFormData = !isUndefined(airDCPPClientConfiguration)
    ? airDCPPClientConfiguration
    : {};

  return (
    <>
      <ConnectionForm
        initialData={initFormData}
        submitHandler={mutate}
        formHeading={"Configure AirDC++"}
      />

      {!isEmpty(airDCPPSessionInformation) ? (
        <AirDCPPSettingsConfirmation settings={airDCPPSessionInformation} />
      ) : null}

      {!isEmpty(airDCPPClientConfiguration) ? (
        <p className="control mt-4">
          as
          <button
            className="button is-danger"
            onClick={() => deleteSettingsMutation.mutate()}
          >
            Delete
          </button>
        </p>
      ) : null}
    </>
  );
};

export default AirDCPPSettingsForm;
