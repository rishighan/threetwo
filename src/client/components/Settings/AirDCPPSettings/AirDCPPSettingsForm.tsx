import React, { ReactElement, useCallback, useContext } from "react";
import {
  saveSettings,
  deleteSettings,
} from "../../../actions/settings.actions";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import { AirDCPPSocketContext } from "../../../context/AirDCPPSocket";
import { isUndefined, isEmpty } from "lodash";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";

export const AirDCPPSettingsForm = (): ReactElement => {
  const airDCPPSettings = useContext(AirDCPPSocketContext);
  console.log(airDCPPSettings);

  //   const onSubmit = useCallback(async (values) => {
  //     try {
  //       airDCPPSettings.setSettings(values);
  //       // dispatch(saveSettings(values, "directConnect"));
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }, []);
  //   const removeSettings = useCallback(async () => {
  //     airDCPPSettings.setSettings({});
  //     // dispatch(deleteSettings());
  //   }, []);
  //
  //   const initFormData = !isUndefined(
  //     airDCPPSettings.airDCPPState.settings.directConnect,
  //   )
  //     ? airDCPPSettings.airDCPPState.settings.directConnect.client.host
  //     : {};

  return (
    <>
      {/* <ConnectionForm
        initialData={initFormData}
        submitHandler={onSubmit}
        formHeading={"Configure AirDC++"}
      />

      {!isEmpty(airDCPPSettings.airDCPPState.socketConnectionInformation) ? (
        <AirDCPPSettingsConfirmation
          settings={airDCPPSettings.airDCPPState.socketConnectionInformation}
        />
      ) : null}

      {!isEmpty(airDCPPSettings.airDCPPState.socketConnectionInformation) ? (
        <p className="control mt-4">
          <button className="button is-danger" onClick={removeSettings}>
            Delete
          </button>
        </p>
      ) : null} */}
    </>
  );
};

export default AirDCPPSettingsForm;
