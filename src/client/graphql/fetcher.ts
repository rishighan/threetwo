/**
 * @fileoverview GraphQL fetcher utility for React Query integration.
 * Provides a generic fetcher function that handles GraphQL requests
 * to the library service backend.
 * @module graphql/fetcher
 */

import { LIBRARY_SERVICE_HOST } from '../constants/endpoints';

/**
 * Creates a GraphQL fetcher function for use with React Query.
 * Handles POST requests to the GraphQL endpoint with proper error handling.
 *
 * @template TData - The expected response data type
 * @template TVariables - The GraphQL variables type
 * @param {string} query - The GraphQL query string
 * @param {TVariables} [variables] - Optional query variables
 * @param {RequestInit['headers']} [options] - Additional request headers
 * @returns {Function} Async function that executes the GraphQL request and returns TData
 * @throws {Error} Throws on HTTP errors or GraphQL errors
 * @example
 * const { data } = useQuery({
 *   queryKey: ['comic', id],
 *   queryFn: fetcher<GetComicQuery, GetComicQueryVariables>(
 *     GET_COMIC_QUERY,
 *     { id }
 *   )
 * });
 */
export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit['headers']
) {
  return async (): Promise<TData> => {
    try {
      const res = await fetch(`${LIBRARY_SERVICE_HOST}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      // Check if the response is OK (status 200-299)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.errors) {
        const { message } = json.errors[0] || {};
        throw new Error(message || 'Error fetching data');
      }

      return json.data;
    } catch (error) {
      // Handle network errors or other fetch failures
      if (error instanceof Error) {
        throw new Error(`Failed to fetch: ${error.message}`);
      }
      throw new Error('Failed to fetch data from server');
    }
  };
}
