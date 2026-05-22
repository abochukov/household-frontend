import { environment } from '../../environments/environment';

const LOCAL_DEFAULT_API_BASE_URL = 'http://localhost:3000';

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = environment.apiBaseUrl?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_DEFAULT_API_BASE_URL;
    }

    return window.location.origin;
  }

  return LOCAL_DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
