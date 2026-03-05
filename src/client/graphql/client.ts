import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { LIBRARY_SERVICE_HOST } from '../constants/endpoints';

const httpLink = new HttpLink({
  uri: `${LIBRARY_SERVICE_HOST}/graphql`,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});
