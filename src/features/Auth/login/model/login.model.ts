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
}

interface LoginApiResponse {
    data?: {
        userProfile?: AuthUser;
        session?: { access_token?: string };
    };
    token?: string;
    session?: { access_token?: string };
    error?: string | { message?: string };
    message?: string;
}

export interface AuthSession {
    token: string;
    user: AuthUser;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const getErrorMessage = (data: LoginApiResponse): string => {
    if (typeof data.error === 'string') return data.error;
    return data.error?.message || data.message || 'Login failed';
};

export const LoginModel = {
    authenticate: async ({ email, password }: LoginCredentials): Promise<AuthSession> => {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json() as LoginApiResponse;

        if (!response.ok) throw new Error(getErrorMessage(data));

        const token = data.data?.session?.access_token
            || data.token
            || data.session?.access_token;

        if (!token) throw new Error('No valid token received from the server');

        return {
            token,
            user: data.data?.userProfile ?? { email },
        };
    },

    createDevelopmentSession: (email: string): AuthSession => ({
        token: 'local-development-preview',
        user: { email, username: 'Admin', roles: ['admin'] },
    }),

    saveSession: ({ token, user }: AuthSession): void => {
        localStorage.setItem('token', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
    },
};
