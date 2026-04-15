/**
 * @fileoverview API endpoint configuration constants.
 * Builds URIs for all microservices used by the application.
 * Supports environment-based configuration via Vite environment variables.
 * @module constants/endpoints
 */

/**
 * Constructs a full URI from protocol, host, port, and path components.
 *
 * @param {Record<string, string>} options - URI component options
 * @param {string} options.protocol - Protocol (http, https, ws, wss)
 * @param {string} options.host - Hostname or IP address
 * @param {string} options.port - Port number
 * @param {string} options.apiPath - API path prefix
 * @returns {string} Complete URI string
 * @example
 * hostURIBuilder({ protocol: "http", host: "localhost", port: "3000", apiPath: "/api" })
 * // Returns "http://localhost:3000/api"
 */
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

// =============================================================================
// SERVICE ENDPOINT CONSTANTS
// =============================================================================

/**
 * CORS proxy server URI for bypassing cross-origin restrictions.
 * @constant {string}
 */
export const CORS_PROXY_SERVER_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "8050",
  apiPath: "/",
});

export const COMICVINE_SERVICE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3080",
  apiPath: "/api/comicvine",
});

export const METRON_SERVICE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3080",
  apiPath: "/api/metron",
});

export const API_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "8050",
  apiPath: "/api",
});

export const LIBRARY_SERVICE_HOST = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: ``,
});
export const LIBRARY_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/library",
});
export const SEARCH_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/search",
});

export const SETTINGS_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/settings",
});

export const IMAGETRANSFORMATION_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: "/api/imagetransformation",
});

export const SOCKET_BASE_URI = hostURIBuilder({
  protocol: "ws",
  host: import.meta.env.VITE_UNDERLYING_HOSTNAME || "localhost",
  port: "3001",
  apiPath: `/`,
});

export const JOB_QUEUE_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: `/api/jobqueue`,
});

export const QBITTORRENT_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3060",
  apiPath: `/api/qbittorrent`,
});

export const PROWLARR_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3060",
  apiPath: `/api/prowlarr`,
});

export const TORRENT_JOB_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: `/api/torrentjobs`,
});

export const AIRDCPP_SERVICE_BASE_URI = hostURIBuilder({
  protocol: "http",
  host: import.meta.env.UNDERLYING_HOSTNAME || "localhost",
  port: "3000",
  apiPath: `/api/airdcpp`,
});
