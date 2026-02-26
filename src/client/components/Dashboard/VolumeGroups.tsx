import { map, unionBy } from "lodash";
import React, { ReactElement } from "react";
import ellipsize from "ellipsize";
import { Link, useNavigate } from "react-router-dom";
import Card from "../shared/Carda";
import Header from "../shared/Header";
import useEmblaCarousel from "embla-carousel-react";

export const VolumeGroups = (props): ReactElement => {
  // Till mongo gives us back the deduplicated results with the ObjectId
  const deduplicatedGroups = unionBy(props.volumeGroups, "volumes.id");
  const navigate = useNavigate();
  const navigateToVolumes = (row) => {
    navigate(`/volumes/all`);
  };

  // embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  return (
    <div>
      <Header
        headerContent="Volumes"
        subHeaderContent={<>Based on ComicVine Volume information</>}
        iconClassNames="fa-solid fa-binoculars mr-2"
        link={"/volumes"}
      />
      <div className="-mr-10 sm:-mr-17 lg:-mr-29 xl:-mr-36 2xl:-mr-42 mt-3">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {map(deduplicatedGroups, (data) => {
              return (
                <div
                  key={data._id}
                  className="flex-[0_0_200px] min-w-0 sm:flex-[0_0_220px] md:flex-[0_0_240px] lg:flex-[0_0_260px] xl:flex-[0_0_280px] pr-[15px]"
                >
                  <Card
                    orientation="vertical-2"
                    imageUrl={data.volumes.image.small_url}
                    hasDetails
                  >
                    <div className="py-3">
                      <div className="text-sm">
                        <Link to={`/volume/details/${data._id}`}>
                          {ellipsize(data.volumes.name, 48)}
                        </Link>
                      </div>
                      {/* issue count */}
                      <span className="inline-flex mt-1 items-center bg-slate-50 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded-md dark:text-slate-600 dark:bg-slate-400">
                        <span className="pr-1 pt-1">
                          <i className="icon-[solar--documents-minimalistic-bold-duotone] w-5 h-5"></i>
                        </span>

                        <span className="text-md text-slate-500 dark:text-slate-900">
                          {data.volumes.count_of_issues} issues
                        </span>
                      </span>
                    </div>
                  </Card>
                  <div className="w-11/12 h-2 mx-auto bg-slate-900 rounded-b opacity-75"></div>
                  <div className="w-10/12 h-2 mx-auto bg-slate-900 rounded-b opacity-50"></div>
                  <div className="w-9/12 h-2 mx-auto bg-slate-900 rounded-b opacity-25"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeGroups;
