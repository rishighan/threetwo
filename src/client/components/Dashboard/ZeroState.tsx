import * as React from "react";

interface ZeroStateProps {
  header: string;
  message: string;
}
const ZeroState: React.FunctionComponent<ZeroStateProps> = (props) => {
  return (
    <article className="">
      <div className="">
        <p>{props.header}</p>
        {props.message}
      </div>
    </article>
  );
};

export default ZeroState;
