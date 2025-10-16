export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
}
