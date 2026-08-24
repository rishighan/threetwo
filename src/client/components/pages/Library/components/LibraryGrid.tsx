import React, { useState, useEffect, useMemo, ReactElement } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import {
  removeLeadingPeriod,
  escapePoundSymbol,
} from "../../../../shared/utils/formatting.utils";
import { useTable, usePagination } from "react-table";
import prettyBytes from "pretty-bytes";
import ellipsize from "ellipsize";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isNil, isEmpty, isUndefined } from "lodash";
import Masonry from "react-masonry-css";
import Card from "../../../ui/data-display/Carda";
import { detectIssueTypes } from "../../../../shared/utils/tradepaperback.utils";
import { Link } from "react-router-dom";
import { LIBRARY_SERVICE_HOST, LIBRARY_SERVICE_BASE_URI } from "../../../../constants/endpoints";
import type { LibraryGridProps } from "../../../../types";

interface ComicDoc {
  _id: string;
  rawFileDetails?: {
    cover?: {
      filePath: string;
    };
    name?: string;
  };
  sourcedMetadata?: {
    comicvine?: {
      image?: {
        small_url?: string;
      };
      name?: string;
      volumeInformation?: {
        description?: string;
      };
    };
  };
}

export const LibraryGrid = (libraryGridProps: LibraryGridProps) => {
  const { data: comicsData, isLoading, error } = useQuery({
    queryKey: ["recentComics"],
    queryFn: async () => {
      console.log("Fetching comics from:", `${LIBRARY_SERVICE_BASE_URI}/getComicBooks`);
      const response = await axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooks`,
        method: "POST",
        data: {
          paginationOptions: { size: 25, from: 0 },
          predicate: {},
        },
      });
      console.log("Comics response:", response.data);
      return response;
    },
  });
  const data: ComicDoc[] = comicsData?.data?.docs ?? [];
  const pageTotal: number = comicsData?.data?.totalDocs ?? 0;
  console.log("Parsed data:", data.length, "comics");

  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 3,
    500: 1,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">Loading comics...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <div className="text-center text-red-500">
          Error loading comics: {(error as any)?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          No comics found in your library. Try importing some comics first.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {data.map((comic) => {
          const coverUrl = comic.sourcedMetadata?.comicvine?.image?.small_url ||
                          (comic.rawFileDetails?.cover?.filePath ?
                           `${LIBRARY_SERVICE_HOST}${comic.rawFileDetails.cover.filePath}` :
                           null);
          const title = comic.sourcedMetadata?.comicvine?.name ||
                       comic.rawFileDetails?.name ||
                       'Unknown Comic';

          return (
            <Link key={comic._id} to={`/comic/details/${comic._id}`} className="block mb-4">
              <Card
                imageUrl={coverUrl || undefined}
                title={title}
                subtitle={comic.sourcedMetadata?.comicvine?.volumeInformation?.description}
                className="hover:shadow-lg transition-shadow duration-200"
              />
            </Link>
          );
        })}
      </Masonry>
    </div>
  );
};

export default LibraryGrid;
