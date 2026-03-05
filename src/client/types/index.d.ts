declare module "*.png" {
  const value: string;
  export = value;
}

declare module "*.jpg";
declare module "*.gif";
declare module "*.less";

// Comic types are now generated from GraphQL schema
// Import from '../../graphql/generated' instead
