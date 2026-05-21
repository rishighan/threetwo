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
// import Masonry from "react-masonry-css";
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
  const { data: comicsData } = useQuery({
    queryKey: ["recentComics"],
    queryFn: async () =>
      axios({
        url: `${LIBRARY_SERVICE_BASE_URI}/getComicBooks`,
        method: "POST",
        data: {
          paginationOptions: { size: 25, from: 0 },
          predicate: {},
        },
      }),
  });
  const data: ComicDoc[] = comicsData?.data?.docs ?? [];
  const pageTotal: number = comicsData?.data?.totalDocs ?? 0;
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 3,
    500: 1,
  };

  return (
    <div className="p-4">
      <p>LibraryGrid temporarily disabled - needs react-masonry-css package</p>
    </div>
  );
};

export default LibraryGrid;
