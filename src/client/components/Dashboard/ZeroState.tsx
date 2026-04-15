import * as React from "react";
import type { ZeroStateProps } from "../../types";

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
