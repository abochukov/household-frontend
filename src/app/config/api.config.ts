import { environment } from '../../environments/environment';

const LOCAL_DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL =
  environment.apiBaseUrl && environment.apiBaseUrl.trim().length > 0
    ? environment.apiBaseUrl
    : LOCAL_DEFAULT_API_BASE_URL;
