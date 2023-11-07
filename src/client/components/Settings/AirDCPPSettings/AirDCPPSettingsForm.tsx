import React, { ReactElement, useCallback } from "react";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import { isUndefined, isEmpty } from "lodash";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useStore } from "../../../store/index";
import { useShallow } from "zustand/react/shallow";

export const AirDCPPSettingsForm = (): ReactElement => {
  // const airDCPPSettings = useContext(AirDCPPSocketContext);
  const {
    airDCPPSocketConnected,
    disconnectionInfo,
    socketConnectionInformation,
    airDCPPClientConfiguration,
  } = useStore(
    useShallow((state) => ({
      airDCPPSocketConnected: state.airDCPPSocketConnected,
      disconnectionInfo: state.disconnectionInfo,
      airDCPPClientConfiguration: state.airDCPPClientConfiguration,
      socketConnectionInformation: state.socketConnectionInformation,
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

      {!isEmpty(socketConnectionInformation) ? (
        <AirDCPPSettingsConfirmation settings={socketConnectionInformation} />
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
