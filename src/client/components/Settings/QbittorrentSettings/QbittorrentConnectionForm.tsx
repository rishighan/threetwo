import React, { ReactElement, useCallback, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { getQBitTorrentClientInfo } from "../../../actions/settings.actions";

export const QbittorrentConnectionForm = (): ReactElement => {
  const dispatch = useDispatch();
  const torrents = useSelector(
    (state: RootState) => state.settings.torrentsList,
  );

  useEffect(() => {
    dispatch(getQBitTorrentClientInfo());
  }, []);
  const handleSubmit = () => {};
  return (
    <>
      <pre> {JSON.stringify(torrents, null, 4)} </pre>

      <Form
        onSubmit={handleSubmit}
        // validate={}
        /* initialValues={} */
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h2>Configure Qbittorrent</h2>
            <label className="label">Qbittorrent Hostname</label>
            <div className="field has-addons">
              <p className="control">
                <span className="select">
                  <Field name="protocol" component="select">
                    <option>Protocol</option>
                    <option value="http">http://</option>
                    <option value="https">https://</option>
                  </Field>
                </span>
              </p>
              <div className="control is-expanded">
                <Field name="hostname">
                  {({ input, meta }) => (
                    <div>
                      <input
                        {...input}
                        type="text"
                        placeholder="Qbittorrent hostname"
                        className="input"
                      />
                      {meta.error && meta.touched && (
                        <span className="is-size-7 has-text-danger">
                          {meta.error}
                        </span>
                      )}
                    </div>
                  )}
                </Field>
              </div>
              <p className="control">
                <Field
                  name="port"
                  component="input"
                  className="input"
                  placeholder="Qbittorrent port"
                />
              </p>
            </div>

            <div className="field">
              <label className="label">Credentials</label>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded has-icons-left">
                    <Field
                      name="username"
                      component="input"
                      className="input"
                      placeholder="Username"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-user-ninja"></i>
                    </span>
                  </p>
                </div>
                <div className="field">
                  <p className="control is-expanded has-icons-left has-icons-right">
                    <Field
                      name="password"
                      component="input"
                      type="password"
                      className="input"
                      placeholder="Password"
                    />
                    <span className="icon is-small is-left">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <span className="icon is-small is-right">
                      <i className="fas fa-check"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      />
    </>
  );
};

export default QbittorrentConnectionForm;
