import axios from 'axios';
import { axiosClient, getApiErrorMessage } from '../../../../shared/models/api/axiosClient.api';
import type {
  AuthUser,
  LoginCredentials,
  LoginApiResponse,
  MeApiResponse,
  LogoutApiResponse,
  FeaturesConfig,
} from '../../../../shared/models/types/auth.types';

export type { AuthUser, LoginCredentials, FeaturesConfig };

export const LoginModel = {
  /**
   * Authenticates against the admin-only endpoint. The backend sets the
   * session as HTTP-only cookies (access_token / refresh_token) on the
   * response — no token is ever returned in the JSON body or stored client-side.
   */
  authenticate: async ({ email, password }: LoginCredentials): Promise<AuthUser> => {
    try {
      const response = await axiosClient.post<LoginApiResponse>('/api/auth/login/admin', {
        email,
        password,
      });

      const userProfile = response.data?.data?.userProfile;
      if (!userProfile) {
        throw new Error('Malformed login response: missing userProfile in payload.');
      }

      return {
        uid: userProfile.uid || userProfile.id || '',
        email: userProfile.email,
        username: userProfile.username ?? null,
        profile_picture_url: userProfile.profile_picture_url ?? null,
        roles: userProfile.roles ?? [],
        home_church_id: userProfile.home_church_id ?? null,
        features_config: userProfile.features_config ?? null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  /** Verifies the current HTTP-only session cookie against the backend. */
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const response = await axiosClient.get<MeApiResponse>('/api/auth/me');
      const profile = response.data?.data;
      if (!profile?.email) return null;

      return {
        uid: profile.uid || profile.id || '',
        email: profile.email,
        username: profile.username ?? null,
        profile_picture_url: profile.profile_picture_url ?? null,
        roles: profile.roles ?? [],
        home_church_id: profile.home_church_id ?? null,
        features_config: profile.features_config ?? null,
      };
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosClient.post<LogoutApiResponse>('/api/auth/logout');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Session already expired on backend; treat as logged out
        return;
      }
      throw new Error(getApiErrorMessage(error));
    }
  },
};
