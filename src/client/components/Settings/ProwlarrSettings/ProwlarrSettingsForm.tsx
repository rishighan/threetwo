import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Form, Field } from "react-final-form";
import { PROWLARR_SERVICE_BASE_URI } from "../../../constants/endpoints";
import axios from "axios";

export const ProwlarrSettingsForm = (props) => {
  const { data } = useQuery({
    queryFn: async (): any => {
      return await axios({
        url: `${PROWLARR_SERVICE_BASE_URI}/getIndexers`,
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
  const submitHandler = () => {};
  const initialData = {};
  return (
    <>
      Prowlarr Settings.
      <Form
        onSubmit={submitHandler}
        initialValues={initialData}
        render={({ handleSubmit }) => (
          <form>
            <article
              role="alert"
              className="mt-4 rounded-lg max-w-screen-md border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-s-4 dark:border-blue-600 dark:bg-blue-300 dark:text-slate-600"
            >
              <div>
                <p>Configure Prowlarr integration here.</p>
                <p>
                  Note that you need a Prowlarr instance hosted and running to
                  configure the integration.
                </p>
                <p>
                  See{" "}
                  <a
                    className="underline"
                    href="http://airdcpp.net/docs/installation/installation.html"
                  >
                    here
                  </a>{" "}
                  for Prowlarr installation instructions for various platforms.
                </p>
              </div>
            </article>
          </form>
        )}
      />
    </>
  );
};

export default ProwlarrSettingsForm;
