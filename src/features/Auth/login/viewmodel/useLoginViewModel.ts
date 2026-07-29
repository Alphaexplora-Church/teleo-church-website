import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/useAuth';

export function useLoginViewModel() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const submit = async (): Promise<void> => {
        setError('');
        setIsLoading(true);

        try {
            await login({ email, password });
            navigate('/admin/dashboard');
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const returnToMainSite = (): void => {
        void navigate('/');
    };

    return {
        email,
        password,
        error,
        isLoading,
        setEmail,
        setPassword,
        submit,
        returnToMainSite,
    };
}
