import {apiRequest, ApiResponse} from './api';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse extends ApiResponse {
  user?: AuthUser;
  /** Returned only in development (no SMS/email gateway configured). */
  otp?: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  country?: string;
  phone?: string;
}

export const AuthService = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: {email, password},
    });
  },

  verifyOtp(email: string, code: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: {email, code},
    });
  },

  requestReset(email: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/request-reset', {
      method: 'POST',
      body: {email},
    });
  },

  resetPassword(
    email: string,
    code: string,
    password: string,
  ): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: {email, code, password},
    });
  },
};
