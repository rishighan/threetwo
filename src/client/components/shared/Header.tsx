import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

type IHeaderProps = {
  headerContent: string;
  subHeaderContent: ReactElement;
  iconClassNames: string;
  link?: string;
};

export const Header = (props: IHeaderProps): ReactElement => {
  return (
    <div className="mt-7">
      <div className="">
        {props.link ? (
          <Link to={props.link}>
            <span className="text-xl">
              <span className="underline">
                {props.headerContent}{" "}
                <i className="icon-[solar--arrow-right-up-outline] w-4 h-4" />
              </span>
            </span>
          </Link>
        ) : (
          <div className="text-xl">{props.headerContent}</div>
        )}
        <p className="">{props.subHeaderContent}</p>
      </div>
    </div>
  );
};

export default Header;
