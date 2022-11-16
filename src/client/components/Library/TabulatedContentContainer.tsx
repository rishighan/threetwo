import React, { ReactElement } from "react";
import PullList from "../PullList/PullList";
import { Volumes } from "../Volumes/Volumes";
import WantedComics from "../WantedComics/WantedComics";
import { Library } from "./Library";

interface ITabulatedContentContainerProps {
  category: string;
}

const TabulatedContentContainer = (
  props: ITabulatedContentContainerProps,
): ReactElement => {
  const { category } = props;
  const renderTabulatedContent = () => {
    switch (category) {
      case "library":
        return <Library />;
      case "pullList":
        return <PullList />;
      case "wanted":
        return <WantedComics />;
      case "volumes":
        return <Volumes />;
      default:
        return <></>;
    }
  };

  return renderTabulatedContent();
  // : (
  //   <div className="container">
  //     <section className="section is-small">
  //       <div className="columns">
  //         <div className="column is-two-thirds">
  //           <article className="message is-link">
  //             <div className="message-body">
  //               No comics were found in the library, and Elasticsearch doesn't have any
  //               indices. Try resetting the library from <code>Settings > Flush DB & Temporary Folders</code> and then import your library again.
  //             </div>
  //           </article>
  //           <pre>
  //             {!isUndefined(searchError.data) &&
  //               JSON.stringify(
  //                 searchError.data.meta.body.error.root_cause,
  //                 null,
  //                 4,
  //               )}
  //           </pre>
  //         </div>
  //       </div>
  //     </section>
  //   </div>
  // );
};

export default TabulatedContentContainer;
