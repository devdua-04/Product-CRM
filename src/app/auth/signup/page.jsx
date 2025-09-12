'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to sign up');
            }

            // Redirect to login after successful signup
            router.push('/auth/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#e0f2fe] to-[#fef3c7] relative overflow-hidden">
            
            {/* Floating Animated Blobs */}
            <div className="absolute top-12 left-10 w-28 h-28 bg-blue-300 opacity-20 rounded-full blur-3xl animate-bounce"></div>
            <div className="absolute bottom-14 right-8 w-20 h-20 bg-yellow-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative w-full max-w-md bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
                
                {/* Decorative Inner Glow */}
                <div className="absolute -top-6 left-10 w-16 h-16 bg-yellow-500/20 rounded-full blur-lg"></div>
                <div className="absolute bottom-4 right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>

                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 tracking-wide">
                    Create an Account ✨
                </h2>

                {error && (
                    <p className="text-red-600 text-center bg-red-100 p-3 rounded-lg shadow-sm mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-yellow-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign Up"}
                    </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-6">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
