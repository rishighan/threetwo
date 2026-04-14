import React, { ReactElement } from "react";
import Card from "../shared/Carda";
import { Link, useNavigate } from "react-router-dom";
import ellipsize from "ellipsize";
import { isEmpty, isNil, isUndefined, map } from "lodash";
import { detectIssueTypes } from "../../shared/utils/tradepaperback.utils";
import { determineCoverFile } from "../../shared/utils/metadata.utils";
import Header from "../shared/Header";
import useEmblaCarousel from "embla-carousel-react";
import { GetWantedComicsQuery } from "../../graphql/generated";

type WantedComicsListProps = {
  comics?: GetWantedComicsQuery['getComicBooks']['docs'];
};

export const WantedComicsList = ({
  comics,
}: WantedComicsListProps): ReactElement | null => {
  if (!comics || comics.length === 0) return null;

  const navigate = useNavigate();

  // embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  return (
    <div>
      {/* TODO: Switch iconClassNames to Solar icon */}
      <Header
        headerContent="Wanted Comics"
        subHeaderContent={<>Comics marked as wanted from various sources</>}
        iconClassNames="fa-solid fa-binoculars mr-2"
        link={"/wanted"}
      />
      <div className="-mr-10 sm:-mr-17 lg:-mr-29 xl:-mr-36 2xl:-mr-42 mt-3">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {map(
                  comics,
                  (comic) => {
                    const {
                      id,
                      rawFileDetails,
                      sourcedMetadata,
                    } = comic;

                    // Parse sourced metadata (GraphQL returns as strings)
                    const comicvine = typeof sourcedMetadata?.comicvine === 'string'
                      ? JSON.parse(sourcedMetadata.comicvine)
                      : sourcedMetadata?.comicvine;
                    const comicInfo = typeof sourcedMetadata?.comicInfo === 'string'
                      ? JSON.parse(sourcedMetadata.comicInfo)
                      : sourcedMetadata?.comicInfo;
                    const locg = sourcedMetadata?.locg;

                    const isComicBookMetadataAvailable = !isUndefined(comicvine);
                    const consolidatedComicMetadata = {
                      rawFileDetails,
                      comicvine,
                      comicInfo,
                      locg,
                    };
    
                    const {
                      issueName,
                      url,
                      publisher = null,
                    } = determineCoverFile(consolidatedComicMetadata);
                    const titleElement = (
                      <Link to={"/comic/details/" + id}>
                        {ellipsize(issueName, 20)}
                        <p>{publisher}</p>
                      </Link>
                    );
                    return (
                      <div
                        key={id}
                        className="flex-[0_0_200px] min-w-0 sm:flex-[0_0_220px] md:flex-[0_0_240px] lg:flex-[0_0_260px] xl:flex-[0_0_280px] pr-[15px]"
                      >
                        <Card
                          orientation={"vertical-2"}
                          imageUrl={url}
                          hasDetails
                          title={issueName ? titleElement : <span>No Name</span>}
                          cardState="wanted"
                        >
                          <div className="pb-1">
                            <div className="flex flex-row gap-2">
                              {/* Issue type */}
                              {isComicBookMetadataAvailable &&
                              !isNil(detectIssueTypes(comicvine?.description)) ? (
                                <div className="my-2">
                                  <span className="inline-flex items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-900 dark:bg-slate-400">
                                    <span className="pr-1 pt-1">
                                      <i className="icon-[solar--book-2-line-duotone] w-5 h-5"></i>
                                    </span>
    
                                    <span className="text-md text-slate-500 dark:text-slate-900">
                                      {
                                        detectIssueTypes(comicvine?.description)
                                          ?.displayName
                                      }
                                    </span>
                                  </span>
                                </div>
                              ) : null}
                              {/* Wanted comics - info not available in current GraphQL query */}
                            </div>
                            {/* comicVine metadata presence */}
                            {isComicBookMetadataAvailable && (
                              <img
                                src="/src/client/assets/img/cvlogo.svg"
                                alt={"ComicVine metadata detected."}
                                className="inline-block w-6 h-6 md:w-7 md:h-7 flex-shrink-0 object-contain"
                              />
                            )}
                            {!isEmpty(locg) && (
                              <img
                                src="/src/client/assets/img/locglogo.svg"
                                className="w-7 h-7"
                              />
                            )}
                          </div>
                        </Card>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
  );
};
