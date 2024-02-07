import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PROWLARR_SERVICE_BASE_URI } from "../../../constants/endpoints";
import axios from "axios";

export const ProwlarrSettingsForm = (props) => {
  const { data } = useQuery({
    queryFn: async () => {
      return await axios({
        url: `${PROWLARR_SERVICE_BASE_URI}/indexers`,
        method: "POST",
        data: {
          host: "localhost",
          port: "9696",
          apiKey: "c4f42e265fb044dc81f7e88bd41c3367",
        },
      });
    },
    queryKey: ["prowlarrConnectionResult"],
  });
  console.log(data);
  return <>Prowlarr Settings.</>;
};

export default ProwlarrSettingsForm;
