import {API_BASE_URL} from '../config/env';

export interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
}

function buildQuery(query?: Query): string {
  if (!query) {
    return '';
  }
  const parts = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Thin fetch wrapper that talks JSON to the backend and throws an Error
 * (with the server's message) on any non-success response.
 */
export async function apiRequest<T extends ApiResponse = ApiResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {method = 'GET', body, query} = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      'Could not reach the server. Make sure the backend (XAMPP) is running.',
    );
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch (err) {
    throw new Error(`Unexpected server response (${response.status}).`);
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  return data;
}
