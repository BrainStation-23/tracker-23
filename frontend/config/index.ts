export const config = {
  apiService: process?.env.NEXT_PUBLIC_API || "REST",
  baseUrl:
    process?.env.NEXT_PUBLIC_API === "REST"
      ? process?.env.NEXT_PUBLIC_API_PREFIX_REST
      : process?.env.NEXT_PUBLIC_API_PREFIX_DEV,
};
