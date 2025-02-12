import { SERVICE_URL } from "./config";

/**
 * Builds a complete URL by combining the service base URL with the provided URI
 * @param {string} uri - The URI to append to the service base URL
 * @returns {string} Complete URL with service base URL and URI combined
 * @throws {Error} If SERVICE_URL environment variable is not set
 */
export const buildUrl = (uri: string) => {
  if (!SERVICE_URL) {
    throw new Error("Please provide the SERVICE_URL variable");
  }
  return SERVICE_URL + uri;
};
