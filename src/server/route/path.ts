import { Ipath, IPathRoute } from "../interfaces/path.interface";

function path(url: string): IPathRoute {
  const allRoutes: Ipath = {
    "/extra": {
      methods: ["POST", "GET", "PUT"],
    },
  };
  return allRoutes[url];
}

export default path;
