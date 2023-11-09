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
          className={
            isLoading ? "button is-danger is-loading" : "button is-danger"
          }
          onClick={() => flushDb()}
        >
          <span className="icon">
            <i className="fas fa-eraser"></i>
          </span>
          <span>Flush DB & Temporary Folders</span>
        </button>
      </div>
    </div>
  );
};

export default SystemSettingsForm;
