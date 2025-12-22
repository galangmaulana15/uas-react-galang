// Import modul React dan hooks yang diperlukan
import React, { useState } from 'react';
// Import komponen navigasi dari react-router-dom
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Import ikon-ikon dari lucide-react
import { Film, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
// Import context autentikasi
import { useAuth } from '../context/AuthContext';
// Import fungsi validasi email dan password
import { validateEmail, validatePassword } from '../utils/validation';

// Komponen Login untuk halaman masuk pengguna
const Login = () => {
    // State untuk data form login
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    // State untuk error validasi form
    const [errors, setErrors] = useState({});
    // State untuk status loading saat proses login
    const [loading, setLoading] = useState(false);
    // State untuk error dari API/server
    const [apiError, setApiError] = useState('');
    // State untuk menampilkan password
    const [showPassword, setShowPassword] = useState(false);
    // State untuk mengingat saya
    const [rememberMe, setRememberMe] = useState(false);
    
    // Mendapatkan fungsi login dari context auth
    const { login } = useAuth();
    // Hook untuk navigasi halaman
    const navigate = useNavigate();
    // Hook untuk mendapatkan informasi lokasi saat ini
    const location = useLocation();
    // Mendapatkan halaman sebelumnya dari state location
    const from = location.state?.from?.pathname || '/';

    // Handler untuk perubahan input form
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update formData
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Hapus error untuk field ini jika ada
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Reset error API
        setApiError('');
    };

    // Fungsi untuk validasi form
    const validateForm = () => {
        const newErrors = {};
        
        // Validasi email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        // Validasi password
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        // Set error ke state
        setErrors(newErrors);
        // Return true jika tidak ada error
        return Object.keys(newErrors).length === 0;
    };

    // Handler untuk submit form
    const handleSubmit = async (e) => {
        // Mencegah reload halaman
        e.preventDefault();
        
        // Validasi form, return jika ada error
        if (!validateForm()) {
            return;
        }

        // Set loading true
        setLoading(true);
        // Reset error API
        setApiError('');

        try {
            // Panggil fungsi login dari context
            const result = await login(formData.email, formData.password);
            
            // Jika berhasil, redirect ke halaman sebelumnya atau home
            if (result.success) {
                navigate(from, { replace: true });
            }
        } catch (error) {
            // Tangkap error dan tampilkan
            setApiError(error.message || 'Invalid email or password');
        } finally {
            // Set loading false
            setLoading(false);
        }
    };

    return (
        // Container utama
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
            
            {/* Container form */}
            <div className="max-w-md w-full relative z-10">
                {/* Logo dan judul */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Film className="h-14 w-14 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-400">Sign in to continue to RoncoMovie</p>
                </div>

                {/* Form container */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50">
                    {/* Error message dari API */}
                    {apiError && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <span className="text-red-300">{apiError}</span>
                        </div>
                    )}

                    {/* Form element */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Field email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                {/* Ikon email */}
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                {/* Input email */}
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-3 bg-gray-900/70 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {/* Error message untuk email */}
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Field password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                {/* Tombol show/hide password */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <span className="flex items-center">
                                            <EyeOff className="h-4 w-4 mr-1" />
                                            Hide
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Show
                                        </span>
                                    )}
                                </button>
                            </div>
                            <div className="relative">
                                {/* Ikon password */}
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                {/* Input password */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-900/70 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="Enter your password"
                                />
                            </div>
                            {/* Error message untuk password */}
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember me dan forgot password */}
                        <div className="flex items-center justify-between">
                            {/* Checkbox remember me */}
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-300">Remember me</span>
                            </label>
                            
                            {/* Link forgot password */}
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Tombol submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading ? 'bg-blue-800 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'}`}
                        >
                            {loading ? (
                                // Tampilan saat loading
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-800/80 text-gray-400">New to RoncoMovie?</span>
                            </div>
                        </div>

                        {/* Link register */}
                        <div className="text-center">
                            <Link
                                to="/register"
                                className="inline-block w-full py-3 border-2 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-lg font-medium transition-all duration-300"
                            >
                                Create an account
                            </Link>
                        </div>

                        {/* Petunjuk untuk admin */}
                        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
                            <p>Admin? Use: admin@ronco.com / admin123</p>
                        </div>
                    </form>
                </div>

                {/* Link kembali ke home */}
                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
                    >
                        <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;