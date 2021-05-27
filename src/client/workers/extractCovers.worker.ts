import { walkFolder } from "../actions/fileops.actions";
import { io } from "socket.io-client";

export const greet = async (path: string): Promise<any> => {
  const targetOptions = {
    sourceFolder: path,
    extractTarget: "cover",
    targetExtractionFolder: "./userdata/covers",
    extractionMode: "bulk",
  };

  const pagingConfig = {
    pageLimit: 25,
    page: 1,
  };
  const extractionOptions = {
    ...targetOptions,
    paginationOptions: pagingConfig,
  };
  const walkedFolders = await walkFolder("./comics");

  const socket = io("ws://localhost:3000/", {
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => {
    console.log(`connect ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`disconnect`);
  });
  socket.emit("call", {
    action: "getComicCovers",
    params: {
      extractionOptions,
      walkedFolders,
    },
    opts: { garam: "pasha" },
  });

  socket.on("comicBookCoverMetadata", (data) => {
    console.log(data);
  });
};
