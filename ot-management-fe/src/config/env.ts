const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:5000/api';
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002';

export const env = {
  backendApiUrl,
  appUrl,
};
