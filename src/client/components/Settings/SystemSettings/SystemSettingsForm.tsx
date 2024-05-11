import React, { ReactElement } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const SystemSettingsForm = (): ReactElement => {
  const { mutate: flushDb, isLoading } = useMutation({
    mutationFn: async () => {
      await axios({
        url: `http://localhost:3000/api/library/flushDb`,
        method: "POST",
      });
    },
  });

  return (
    <div className="is-clearfix">
      <div className="mt-4">
        <h3 className="title">Flush DB and Temporary Folders</h3>
        <h6 className="subtitle has-text-grey-light">
          If you are encountering issues, start over using this functionality.
        </h6>
        <article className="message is-danger">
          <div className="message-body is-size-6 is-family-secondary">
            Flushing and resetting will clear out:
            <p>
              <small>(This action is irreversible)</small>
            </p>
            <ol>
              <li>The mongo collection that holds library metadata</li>

              <li>
                Your <code>USERDATA_DIRECTORY</code> which includes
                <code>covers</code>, <code>temporary</code> and
                <code>expanded</code> subfolders.
              </li>
              <li>
                Your <code>Elasticsearch indices</code>
              </li>
            </ol>
          </div>
        </article>

        <article className="message is-info">
          <div className="message-body is-size-6 is-family-secondary">
            Your comic book files are not touched, and your settings will remain
            intact.
          </div>
        </article>

        <button
          className="flex space-x-1 sm:mt-0 sm:flex-row sm:items-center rounded-lg border border-red-400 dark:border-red-200 bg-red-200 px-2 py-1 text-gray-500 hover:bg-transparent hover:text-red-600 focus:outline-none focus:ring active:text-indigo-500"
          onClick={() => flushDb()}
        >
          <span className="pt-1 px-1">
            <i className="icon-[solar--trash-bin-trash-bold-duotone] w-7 h-7"></i>
          </span>
          <span>Flush DB & Temporary Folders</span>
        </button>
      </div>
    </div>
  );
};

export default SystemSettingsForm;
