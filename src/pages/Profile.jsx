// Import modul React dan hooks yang diperlukan
import React, { useState, useEffect } from 'react';
// Import hook untuk navigasi dari react-router-dom
import { useNavigate } from 'react-router-dom';
// Import ikon-ikon dari lucide-react
import { User, Mail, Calendar, Edit, Save, Trash2, AlertCircle, CheckCircle, Camera, Lock } from 'lucide-react';
// Import context autentikasi
import { useAuth } from '../context/AuthContext';
// Import fungsi validasi email
import { validateEmail } from '../utils/validation';

// Komponen Profile untuk mengelola profil pengguna
const Profile = () => {
    // Mendapatkan fungsi dan data user dari context auth
    const { user, updateProfile, deleteAccount, logout, changePassword } = useAuth();
    // Hook untuk navigasi halaman
    const navigate = useNavigate();
    
    // State untuk data form profil
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: null
    });
    // State untuk data form perubahan password
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    // State untuk error validasi
    const [errors, setErrors] = useState({});
    // State untuk status loading
    const [loading, setLoading] = useState(false);
    // State untuk pesan sukses/error
    const [message, setMessage] = useState({ type: '', text: '' });
    // State untuk tab aktif (profile/password)
    const [activeTab, setActiveTab] = useState('profile');
    // State untuk preview avatar
    const [avatarPreview, setAvatarPreview] = useState('');
    // State untuk menampilkan konfirmasi penghapusan akun
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // State untuk teks konfirmasi penghapusan akun
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    // Effect untuk mengisi form dengan data user saat komponen mount atau user berubah
    useEffect(() => {
        // Jika tidak ada user, redirect ke halaman login
        if (!user) {
            navigate('/login');
            return;
        }
        
        // Set data form dengan data user
        setFormData({
            name: user.name || '',
            email: user.email || '',
            bio: user.profile?.bio || '',
            avatar: user.profile?.avatar || null
        });
    }, [user, navigate]);

    // Handler untuk perubahan input form profil
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update formData
        setFormData(prev => ({ ...prev, [name]: value }));
        // Hapus error untuk field ini jika ada
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handler untuk perubahan input form password
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        // Update passwordData
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Handler untuk perubahan avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Buat preview avatar
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Fungsi untuk validasi form profil
    const validateProfile = () => {
        const newErrors = {};
        
        // Validasi nama
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        // Validasi email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        // Set error ke state
        setErrors(newErrors);
        // Return true jika tidak ada error
        return Object.keys(newErrors).length === 0;
    };

    // Fungsi untuk validasi form password
    const validatePassword = () => {
        const newErrors = {};
        
        // Validasi password saat ini
        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        
        // Validasi password baru
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        
        // Validasi konfirmasi password
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Set error ke state
        setErrors(newErrors);
        // Return true jika tidak ada error
        return Object.keys(newErrors).length === 0;
    };

    // Handler untuk submit form profil
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi form, return jika ada error
        if (!validateProfile()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Panggil fungsi updateProfile dari context
            const result = await updateProfile({
                name: formData.name,
                email: formData.email,
                profile: {
                    ...user.profile,
                    bio: formData.bio,
                    avatar: formData.avatar
                }
            });
            
            // Jika sukses, tampilkan pesan sukses
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            // Tangkap error dan tampilkan
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk submit form password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi form, return jika ada error
        if (!validatePassword()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Panggil fungsi changePassword dari context
            const result = await changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            
            // Jika sukses, tampilkan pesan sukses dan reset form
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            // Tangkap error dan tampilkan
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk menghapus akun dengan validasi konfirmasi
    const handleDeleteAccount = async () => {
        // Validasi: user harus mengetik "DELETE" untuk konfirmasi
        if (deleteConfirmationText !== 'DELETE') {
            setMessage({ type: 'error', text: 'Please type "DELETE" exactly to confirm' });
            return;
        }

        setLoading(true);
        
        try {
            // Panggil fungsi deleteAccount dari context
            const result = await deleteAccount(deleteConfirmationText);
            
            // Jika sukses, logout dan redirect ke halaman home
            if (result.success) {
                logout();
                navigate('/');
            }
        } catch (error) {
            // Tangkap error dan tampilkan
            setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteConfirmationText('');
        }
    };

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Jika tidak ada user, return null
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen text-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-gray-400 text-lg">Manage your account settings and preferences</p>
                </div>

                {/* Konten utama dalam layout flex */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar kiri untuk informasi profil */}
                    <div className="lg:w-1/3">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                            {/* Avatar dan info user */}
                            <div className="text-center mb-8">
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    {/* Efek gradient blur di belakang avatar */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                                    {/* Container avatar */}
                                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-800">
                                        {avatarPreview || user.profile?.avatar ? (
                                            // Tampilkan avatar jika ada
                                            <img
                                                src={avatarPreview || user.profile.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            // Tampilkan ikon default jika tidak ada avatar
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                <User className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Tombol untuk mengubah avatar */}
                                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                                        <Camera className="h-4 w-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                                <p className="text-gray-400 mb-2">{user.email}</p>
                                {/* Badge untuk role user */}
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30">
                                    <span className={`h-2 w-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                    <span className="text-sm capitalize">{user.role}</span>
                                </div>
                            </div>

                            {/* Info tambahan user */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                    <span className="text-gray-400">Member Since</span>
                                    <span className="font-medium flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {formatDate(user.joinedDate)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                    <span className="text-gray-400">Role</span>
                                    <span className="font-medium capitalize">
                                        {user.role === 'admin' ? 'Administrator' : 'User'}
                                    </span>
                                </div>
                            </div>

                            {/* Navigasi tab */}
                            <div className="mt-8">
                                <nav className="space-y-2">
                                    {/* Tab Profile Settings */}
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === 'profile' 
                                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <span className="flex items-center">
                                            <User className="h-5 w-5 mr-3" />
                                            Profile Settings
                                        </span>
                                    </button>
                                    
                                    {/* Tab Change Password */}
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === 'password' 
                                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <span className="flex items-center">
                                            <Lock className="h-5 w-5 mr-3" />
                                            Change Password
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Konten kanan untuk form edit */}
                    <div className="lg:w-2/3">
                        {/* Tampilkan pesan sukses/error */}
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' 
                                ? 'bg-green-900/20 border-green-700/30 text-green-300' 
                                : 'bg-red-900/20 border-red-700/30 text-red-300'
                            }`}>
                                <div className="flex items-center">
                                    {message.type === 'success' ? (
                                        <CheckCircle className="h-5 w-5 mr-3" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 mr-3" />
                                    )}
                                    {message.text}
                                </div>
                            </div>
                        )}

                        {/* Konten untuk tab Profile */}
                        {activeTab === 'profile' && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <Edit className="h-6 w-6 mr-3 text-blue-400" />
                                    Edit Profile
                                </h3>
                                
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    {/* Grid untuk nama dan email */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Input nama */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-3 py-3 bg-gray-900/70 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                />
                                            </div>
                                            {/* Error message untuk nama */}
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Input email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-3 py-3 bg-gray-900/70 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                                    </div>

                                    {/* Input bio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    {/* Tombol submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading 
                                            ? 'bg-blue-800 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            // Tampilan saat loading
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </div>
                                        ) : (
                                            // Tampilan normal
                                            <span className="flex items-center justify-center">
                                                <Save className="h-5 w-5 mr-2" />
                                                Save Changes
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Konten untuk tab Password */}
                        {activeTab === 'password' && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <Lock className="h-6 w-6 mr-3 text-blue-400" />
                                    Change Password
                                </h3>
                                
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    {/* Input password saat ini */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Current Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 bg-gray-900/70 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        {/* Error message untuk password saat ini */}
                                        {errors.currentPassword && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.currentPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Input password baru */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            New Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 bg-gray-900/70 border ${errors.newPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        {/* Error message untuk password baru */}
                                        {errors.newPassword && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Input konfirmasi password baru */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Confirm New Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 bg-gray-900/70 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        {/* Error message untuk konfirmasi password */}
                                        {errors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    {/* Persyaratan password */}
                                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            {/* Minimum karakter */}
                                            <li className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${passwordData.newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                At least 6 characters
                                            </li>
                                            {/* Huruf kapital */}
                                            <li className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                One uppercase letter
                                            </li>
                                            {/* Angka */}
                                            <li className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                One number
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Tombol submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading 
                                            ? 'bg-blue-800 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            // Tampilan saat loading
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Changing Password...
                                            </div>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Danger Zone untuk penghapusan akun */}
                <div className="mt-8 bg-red-900/10 border border-red-700/30 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center">
                        <AlertCircle className="h-6 w-6 mr-3" />
                        Danger Zone
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Peringatan penghapusan akun */}
                        <p className="text-gray-400">
                            Once you delete your account, there is no going back. All your data including favorites, watchlists, and profile information will be permanently deleted.
                        </p>
                        
                        {/* Cek jika user adalah admin default (tidak bisa dihapus) */}
                        {user.email === 'admin@ronco.com' ? (
                            // Notifikasi untuk admin default
                            <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                                <p className="text-yellow-300">
                                    <strong>Note:</strong> Default admin account cannot be deleted. This is a system account.
                                </p>
                            </div>
                        ) : (
                            // Form untuk penghapusan akun non-admin
                            <>
                                {!showDeleteConfirm ? (
                                    // Tombol untuk memulai proses penghapusan
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        <span>Delete My Account</span>
                                    </button>
                                ) : (
                                    // Form konfirmasi penghapusan akun
                                    <div className="p-4 bg-gray-900/50 rounded-lg border border-red-700/50">
                                        <h4 className="text-lg font-semibold mb-2 text-white">Are you absolutely sure?</h4>
                                        <p className="text-gray-400 mb-4">
                                            This action cannot be undone. Please type <strong>"DELETE"</strong> exactly to confirm.
                                        </p>
                                        
                                        <div className="space-y-4">
                                            {/* Input konfirmasi */}
                                            <input
                                                type="text"
                                                placeholder='Type "DELETE" to confirm'
                                                value={deleteConfirmationText}
                                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                            {/* Tombol aksi */}
                                            <div className="flex space-x-4">
                                                {/* Tombol hapus akun (hanya aktif jika teks benar) */}
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={loading || deleteConfirmationText !== 'DELETE'}
                                                    className={`px-6 py-2 rounded-lg transition-colors ${deleteConfirmationText === 'DELETE' 
                                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                        : 'bg-red-800/50 text-red-300 cursor-not-allowed'}`}
                                                >
                                                    {loading ? 'Deleting...' : 'Yes, Delete Account'}
                                                </button>
                                                {/* Tombol batal */}
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeleteConfirmationText('');
                                                    }}
                                                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;