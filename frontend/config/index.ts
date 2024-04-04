console.log("process.env", process.env);

export const config = {
  apiService: process?.env.NEXT_PUBLIC_API || "REST",
  baseUrl:
    process?.env.NEXT_PUBLIC_API === "REST"
      ? process?.env.NEXT_PUBLIC_API_PREFIX_REST
      : process?.env.NEXT_PUBLIC_API_PREFIX_DEV,
  NEXT_PUBLIC_ADMIN_EMAIL: process?.env.NEXT_PUBLIC_API_ADMIN_EMAIL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process?.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};
