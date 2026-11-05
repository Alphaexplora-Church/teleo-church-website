import type { ChurchFeatures } from '../../../../shared/models/globalTypes';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthUser {
    uid?: string;
    email: string;
    username?: string | null;
    roles?: string[];
    home_church_id?: number | string | null;
    profile_picture_url?: string | null;
    /** Feature flags from church_profile.features_config — null means not loaded yet */
    features_config?: ChurchFeatures | null;
}

interface LoginApiResponse {
    data?: { userProfile?: AuthUser };
    message?: string;
    errorCode?: string;
    details?: Array<{ field: string; message: string }>;
}

interface MeApiResponse {
    data?: {
        id?: string;
        email?: string;
        username?: string | null;
        profile_picture_url?: string | null;
        roles?: string[];
        home_church_id?: number | null;
        features_config?: ChurchFeatures | null;
    };
    message?: string;
}

interface LogoutApiResponse {
    message?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const getErrorMessage = (data: { message?: string; details?: Array<{ message: string }> }): string =>
    data.details?.[0]?.message || data.message || 'Something went wrong';

export const LoginModel = {
    /**
     * Authenticates against the admin-only endpoint. The backend sets the
     * session as HTTP-only cookies (access_token / refresh_token) on the
     * response — no token is ever returned in the JSON body or stored client-side.
     */
    authenticate: async ({ email, password }: LoginCredentials): Promise<AuthUser> => {
        const response = await fetch(`${API_BASE}/api/auth/login/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json() as LoginApiResponse;

        if (!response.ok) throw new Error(getErrorMessage(data));
        if (!data.data?.userProfile) throw new Error('Malformed login response from the server');

        return data.data.userProfile;
    },

    /** Verifies the current HTTP-only session cookie against the backend. */
    getCurrentUser: async (): Promise<AuthUser | null> => {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) return null;

        const data = await response.json() as MeApiResponse;
        if (!data.data?.email) return null;

        return {
            uid: data.data.id,
            email: data.data.email ?? '',
            username: data.data.username ?? null,
            profile_picture_url: data.data.profile_picture_url ?? null,
            roles: data.data.roles ?? [],
            home_church_id: data.data.home_church_id ?? null,
            features_config: data.data.features_config ?? null,
        };
    },

    logout: async (): Promise<void> => {
        const response = await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok && response.status !== 401) {
            const data = await response.json() as LogoutApiResponse;
            throw new Error(data.message ?? 'Logout failed');
        }
    },
};
