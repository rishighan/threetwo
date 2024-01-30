import React, { ReactElement } from "react";

type IHeaderProps = {
  headerContent: string;
  subHeaderContent: string;
  iconClassNames: string;
};

export const Header = (props: IHeaderProps): ReactElement => {
  return (
    <div className="mt-7">
      <div className="">
        <a className="" onClick={() => {}}>
          <span className="text-xl">
            <i className=""></i> {props.headerContent}
          </span>
        </a>
        <p className="">{props.subHeaderContent}</p>
      </div>
    </div>
  );
};

export default Header;
