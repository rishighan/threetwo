import React, { ReactElement } from "react";

type IHeaderProps = {
  headerContent: string;
  subHeaderContent: string;
  iconClassNames: string;
};

export const Header = (props: IHeaderProps): ReactElement => {
  return (
    <>
      <h4 className="title is-4">
        <i className={props.iconClassNames}></i> {props.headerContent}
      </h4>
      <p className="subtitle is-7">{props.subHeaderContent}</p>
    </>
  );
};

export default Header;
