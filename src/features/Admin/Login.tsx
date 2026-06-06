import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Login failed');
                return;
            }

            const token = data.session?.access_token;
            if (token) {
                localStorage.setItem('token', token);
            }

            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            setError('Network error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-midnight-teal">
            <div className="w-full max-w-md p-8 bg-soft-linen/5 backdrop-blur-md rounded-xl shadow-lg">
                <h2 className="text-3xl font-serif text-soft-linen mb-6 text-center">Admin Login</h2>
                {error && (
                    <p className="text-harvest-orange text-center mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="group relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-soft-linen/10 py-4 text-soft-linen focus:border-harvest-orange outline-none transition-all font-serif text-3xl placeholder:text-soft-linen/5"
                            placeholder="Email"
                        />
                        <label className="absolute -top-6 left-0 text-[10px] uppercase tracking-widest text-harvest-orange opacity-0 group-focus-within:opacity-100 transition-opacity">
                            Email
                        </label>
                    </div>

                    <div className="group relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-soft-linen/10 py-4 text-soft-linen focus:border-harvest-orange outline-none transition-all font-serif text-3xl placeholder:text-soft-linen/5"
                            placeholder="Password"
                        />
                        <label className="absolute -top-6 left-0 text-[10px] uppercase tracking-widest text-harvest-orange opacity-0 group-focus-within:opacity-100 transition-opacity">
                            Password
                        </label>
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-harvest-orange text-soft-linen px-16 py-6 rounded-full font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-harvest-orange/20"
                    >
                        Log In
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
