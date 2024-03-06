export const config = {
  apiService: process?.env.NEXT_PUBLIC_API || "REST",
  baseUrl:
    process?.env.NEXT_PUBLIC_API === "REST"
      ? process?.env.NEXT_PUBLIC_API_PREFIX_REST
      : process?.env.NEXT_PUBLIC_API_PREFIX_DEV,
  adminMail: process?.env.NEXT_PUBLIC_API_ADMIN_EMAIL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process?.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};
