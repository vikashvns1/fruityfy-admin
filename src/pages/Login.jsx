import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/api'; // Import the base URL from api.js

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Connect to your Backend API
            const res = await axios.post(`${API_BASE}/auth/login`, {
                email,
                password
            });

            if (res.data.success) {
                // 1. Save Token & User Info
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.data.user));

                // 2. Show Success Message
                toast.success(`Welcome back, ${res.data.data.user.full_name}! 🍋`);

                // 3. Go to Dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Login Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-yellow px-4">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-brand-green/10">

                {/* Logo Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-green font-serif mb-2">Fruityfy</h1>
                    <p className="text-brand-gold font-medium tracking-wide text-sm uppercase">Admin Control Panel</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-brand-green mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-brand-yellow/5 transition-all"
                            placeholder="admin@fruityfy.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-green mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 bg-brand-yellow/5 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#064E3B] text-white py-3 rounded-xl font-bold hover:bg-[#053d2e] transition-colors shadow-lg mt-4"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">© 2026 Fruityfy Dubai. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;