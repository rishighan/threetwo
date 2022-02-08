export const hostURIBuilder = (options: Record<string, string>): string => {
  return (
    options.protocol +
    "://" +
    options.host +
    ":" +
    options.port +
    options.apiPath
  );
};

export const CORS_PROXY_SERVER_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "8050",
  apiPath: "/",
});

export const COMICVINE_SERVICE_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3080",
  apiPath: "/api/comicvine",
});

export const METRON_SERVICE_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3080",
  apiPath: "/api/metron",
});

export const API_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "8050",
  apiPath: "/api",
});

export const LIBRARY_SERVICE_HOST = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: ``,
});
export const LIBRARY_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/library",
});

export const SETTINGS_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/settings",
});

export const IMAGETRANSFORMATION_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/imagetransformation",
});

export const SOCKET_BASE_URI = hostURIBuilder({
  protocol: "ws",
  host: process.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3001",
  apiPath: `/`,
});
