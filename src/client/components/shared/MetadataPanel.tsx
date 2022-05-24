import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import ellipsize from "ellipsize";
import convert from "html-to-text";
import { escapePoundSymbol } from "../../shared/utils/formatting.utils";
import prettyBytes from "pretty-bytes";
import { LIBRARY_SERVICE_HOST } from "../../constants/endpoints";
import { Card } from "../Carda";

interface IMetadatPanelProps {
  value: any;
  children: any;
}
export const MetadataPanel = (props: IMetadatPanelProps): ReactElement => {

  console.log(props)
  return (
    <div className="columns">
      <div className="column">
        <div className="comic-detail issue-metadata">
          <dl>
            <dd>
              <div className="columns mt-2">
                <div className="column is-3">
                  <Card
                    imageUrl={"asd"}
                    orientation={"vertical"}
                    hasDetails={false}
                    // cardContainerStyle={{ maxWidth: 200 }}
                  />
                </div>
                <div className="column">{props.children}</div>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel;
