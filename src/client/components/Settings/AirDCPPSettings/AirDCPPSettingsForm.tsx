import React, { ReactElement, useCallback } from "react";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import { isUndefined, isEmpty } from "lodash";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useStore } from "../../../store/index";
import { useShallow } from "zustand/react/shallow";

export const AirDCPPSettingsForm = (): ReactElement => {
  // cherry-picking selectors for:
  // 1. initial values for the form
  // 2. If initial values are present, get the socket information to display
  const {
    airDCPPSocketConnected,
    airDCPPDisconnectionInfo,
    airDCPPSocketConnectionInformation,
    airDCPPClientConfiguration,
    airDCPPSocketInstance,
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketConnected: state.airDCPPSocketConnected,
      airDCPPDisconnectionInfo: state.airDCPPDisconnectionInfo,
      airDCPPClientConfiguration: state.airDCPPClientConfiguration,
      airDCPPSocketConnectionInformation:
        state.airDCPPSocketConnectionInformation,
      airDCPPSocketInstance: state.airDCPPSocketInstance,
    })),
  );
  const onSubmit = useCallback(async (values) => {
    try {
      // airDCPPSettings.setSettings(values);
    } catch (error) {
      console.log(error);
    }
  }, []);
  const removeSettings = useCallback(async () => {
    // airDCPPSettings.setSettings({});
  }, []);
  //
  const initFormData = !isUndefined(airDCPPClientConfiguration)
    ? airDCPPClientConfiguration
    : {};

  return (
    <>
      <ConnectionForm
        initialData={initFormData}
        submitHandler={onSubmit}
        formHeading={"Configure AirDC++"}
      />

      {!isEmpty(airDCPPSocketConnectionInformation) ? (
        <AirDCPPSettingsConfirmation
          settings={airDCPPSocketConnectionInformation}
        />
      ) : null}

      {!isEmpty(airDCPPClientConfiguration) ? (
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
