import { isEmpty, isUndefined } from "lodash";
import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchIssue } from "../../actions/fileops.actions";
import { Library } from "./Library";

const LibraryContainer = (): ReactElement => {
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch(
  //     searchIssue(
  //       {
  //         query: {},
  //       },
  //       {
  //         pagination: {
  //           size: 25,
  //           from: 0,
  //         },
  //         type: "all",
  //         trigger: "libraryPage"
  //       },
  //     ),
  //   );
  // }, []);

  // const searchResults = useSelector(
  //   (state: RootState) => state.fileOps.libraryComics,
  // );
  // const searchError = useSelector(
  //   (state: RootState) => state.fileOps.librarySearchError,
  // );

  return  (
    <Library  />) 
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

export default LibraryContainer;
