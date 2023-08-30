import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getServiceStatus } from "../../actions/fileops.actions";

export const ServiceStatuses = (): ReactElement => {
  const serviceStatus = useSelector(
    (state: RootState) => state.fileOps.libraryServiceStatus,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getServiceStatus());
  }, []);
  return (
    <div className="is-clearfix">
      <div className="mt-4">
        <h3 className="title">Core Services</h3>
        <h6 className="subtitle has-text-grey-light">
          Statuses for core services
        </h6>
      </div>
      <pre>{JSON.stringify(serviceStatus, null, 2)}</pre>
    </div>
  );
};
