/**
 * Normalized Authentication and Session Types
 * Aligned with backend contract: HTTP-only cookies session + role-based feature flags
 */

export interface FeaturesConfig {
  prayer_wall: boolean;
  content_management: boolean;
  services: boolean;
  community: boolean;
  giving: boolean;
  events_announcement: boolean;
  registrations: boolean;
  [key: string]: boolean | undefined;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  email: string;
  username?: string | null;
  profile_picture_url?: string | null;
  roles?: string[];
  home_church_id?: number | string | null;
  features_config?: FeaturesConfig | null;
}

export interface AuthUser {
  uid: string;
  email: string;
  username?: string | null;
  profile_picture_url?: string | null;
  roles: string[];
  home_church_id?: number | string | null;
  features_config: FeaturesConfig | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  errorCode?: string;
  details?: ApiErrorDetail[];
}

export interface LoginApiResponse {
  data?: {
    userProfile?: UserProfile;
  };
  message?: string;
  errorCode?: string;
  details?: ApiErrorDetail[];
}

export interface MeApiResponse {
  data?: UserProfile;
  message?: string;
}

export interface LogoutApiResponse {
  message?: string;
}
