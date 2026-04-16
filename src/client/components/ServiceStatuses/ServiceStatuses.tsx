import React, { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LIBRARY_SERVICE_BASE_URI } from "../../constants/endpoints";

export const ServiceStatuses = (): ReactElement => {
  const { data } = useQuery({
    queryKey: ["serviceStatus"],
    queryFn: async () =>
      axios({ url: `${LIBRARY_SERVICE_BASE_URI}/getHealthInformation`, method: "GET" }),
  });
  const serviceStatus = data?.data;
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
