export const config = {
  apiService: process?.env.NEXT_PUBLIC_API || "REST",
  graphqlPrefix:
    process?.env.NEXT_PUBLIC_API_PREFIX_GRAPHQL ||
    "http://localhost:3000/graphql",
  baseUrl:
    process?.env.NEXT_PUBLIC_API === "REST"
      ? process?.env.NEXT_PUBLIC_API_PREFIX_REST
      : process?.env.NEXT_PUBLIC_API_PREFIX_DEV,
};
