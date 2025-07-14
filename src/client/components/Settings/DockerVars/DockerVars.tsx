import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const DockerVars = (): React.ReactElement => {
  const [environmentVariables, setEnvironmentVariables] = React.useState<
    Record<string, string>
  >({});
  const { data } = useQuery({
    queryKey: ["docker-vars"],
    queryFn: async () => {
      await axios({
        method: "GET",
        url: "http://localhost:3000/api/settings/getEnvironmentVariables",
      }).then((response) => {
        setEnvironmentVariables(response.data);
      });
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  console.log("Docker Vars: ", environmentVariables);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Docker Environment Variables</h2>
      <p className="text-gray-600 dark:text-gray-400">
        <pre>
          {Object.entries(environmentVariables).length > 0
            ? JSON.stringify(environmentVariables, null, 2)
            : "No environment variables found."}
        </pre>
      </p>
      {/* Add your form or content for Docker environment variables here */}
    </div>
  );
};

export default DockerVars;
