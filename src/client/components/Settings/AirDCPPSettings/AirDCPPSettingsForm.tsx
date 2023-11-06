import React, { ReactElement, useCallback, useContext } from "react";
import {
  saveSettings,
  deleteSettings,
} from "../../../actions/settings.actions";
import { AirDCPPSettingsConfirmation } from "./AirDCPPSettingsConfirmation";
import { isUndefined, isEmpty } from "lodash";
import { ConnectionForm } from "../../shared/ConnectionForm/ConnectionForm";
import { useStore } from "../../../store/index";

export const AirDCPPSettingsForm = (): ReactElement => {
  // const airDCPPSettings = useContext(AirDCPPSocketContext);
  const airDCPPSettings = useStore((store) => store.airDCPPClientConfiguration);
  console.log(airDCPPSettings);

  const onSubmit = useCallback(async (values) => {
    try {
      airDCPPSettings.setSettings(values);
    } catch (error) {
      console.log(error);
    }
  }, []);
  const removeSettings = useCallback(async () => {
    airDCPPSettings.setSettings({});
  }, []);
  //
  const initFormData = !isUndefined(airDCPPSettings.airDCPPState.settings)
    ? airDCPPSettings.airDCPPState.settings
    : {};

  return (
    <>
      <ConnectionForm
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
      ) : null}
    </>
  );
};

export default AirDCPPSettingsForm;
