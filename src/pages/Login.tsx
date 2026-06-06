import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Make sure this URL matches your backend environment setup
            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save the token to localStorage
            // Fallback to checking different token paths based on typical Supabase responses
            const token = data?.data?.session?.access_token || data?.token || data?.session?.access_token;

            if (token) {
                localStorage.setItem('token', token);
                if (data?.data?.user) {
                    localStorage.setItem('adminUser', JSON.stringify(data.data.user));
                }
                navigate('/admin/dashboard');
            } else {
                throw new Error('No valid token received from the server');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-midnight-teal flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-deep-teal/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-harvest-orange/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-soft-linen/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="font-serif text-3xl md:text-4xl tracking-tighter lowercase text-soft-linen mb-2">
                        words of life.
                    </h1>
                    <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-soft-linen/50 font-bold">
                        Admin Portal
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                        >
                            <p className="text-red-400 text-xs text-center font-sans tracking-wide">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block font-sans text-[10px] uppercase tracking-[0.15em] text-soft-linen/70 font-bold mb-2 ml-1"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-soft-linen/10 rounded-xl px-4 py-3.5 text-soft-linen font-sans text-sm focus:outline-none focus:border-harvest-orange/50 focus:bg-white/10 transition-all placeholder:text-soft-linen/20"
                                placeholder="admin@wordsoflife.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block font-sans text-[10px] uppercase tracking-[0.15em] text-soft-linen/70 font-bold mb-2 ml-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-soft-linen/10 rounded-xl px-4 py-3.5 text-soft-linen font-sans text-sm focus:outline-none focus:border-harvest-orange/50 focus:bg-white/10 transition-all placeholder:text-soft-linen/20"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative group overflow-hidden rounded-xl bg-harvest-orange text-midnight-teal font-sans text-xs uppercase tracking-[0.2em] font-bold py-4 mt-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-midnight-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="font-sans text-[10px] uppercase tracking-[0.1em] text-soft-linen/40 hover:text-soft-linen transition-colors"
                    >
                        &larr; Return to main site
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
