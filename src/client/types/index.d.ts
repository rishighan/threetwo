declare module "*.png" {
  const value: string;
  export = value;
}

declare module "*.jpg";
declare module "*.gif";
declare module "*.less";
declare module "*.scss";
declare module "*.css";

// Comic types are now generated from GraphQL schema
// Import from '../../graphql/generated' instead
