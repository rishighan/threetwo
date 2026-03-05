import { LIBRARY_SERVICE_HOST } from '../constants/endpoints';

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
