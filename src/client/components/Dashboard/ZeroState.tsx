import * as React from "react";

interface ZeroStateProps {
  header: string;
  message: string;
}
const ZeroState: React.FunctionComponent<ZeroStateProps> = (props) => {
  return (
    <article className="message is-info">
      <div className="message-body">
        <p>{props.header}</p>
        {props.message}
      </div>
    </article>
  );
};

export default ZeroState;
