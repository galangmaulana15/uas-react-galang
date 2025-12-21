import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Edit, Save, Trash2, AlertCircle, CheckCircle, Camera, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';

const Profile = () => {
    const { user, updateProfile, deleteAccount, logout, changePassword } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: null
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        setFormData({
            name: user.name || '',
            email: user.email || '',
            bio: user.profile?.bio || '',
            avatar: user.profile?.avatar || null
        });
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateProfile = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const newErrors = {};
        
        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateProfile()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await updateProfile({
                name: formData.name,
                email: formData.email,
                profile: {
                    ...user.profile,
                    bio: formData.bio,
                    avatar: formData.avatar
                }
            });
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePassword()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    // PERBAIKAN: Validasi delete account
    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== 'DELETE') {
            setMessage({ type: 'error', text: 'Please type "DELETE" exactly to confirm' });
            return;
        }

        setLoading(true);
        
        try {
            const result = await deleteAccount(deleteConfirmationText);
            
            if (result.success) {
                logout();
                navigate('/');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteConfirmationText('');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen text-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-gray-400 text-lg">Manage your account settings and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                            <div className="text-center mb-8">
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-800">
                                        {avatarPreview || user.profile?.avatar ? (
                                            <img
                                                src={avatarPreview || user.profile.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                <User className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
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
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30">
                                    <span className={`h-2 w-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                    <span className="text-sm capitalize">{user.role}</span>
                                </div>
                            </div>

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

                            <div className="mt-8">
                                <nav className="space-y-2">
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

                    <div className="lg:w-2/3">
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

                        {activeTab === 'profile' && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <Edit className="h-6 w-6 mr-3 text-blue-400" />
                                    Edit Profile
                                </h3>
                                
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
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
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

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
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading 
                                            ? 'bg-blue-800 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <Save className="h-5 w-5 mr-2" />
                                                Save Changes
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <Lock className="h-6 w-6 mr-3 text-blue-400" />
                                    Change Password
                                </h3>
                                
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
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
                                        {errors.currentPassword && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.currentPassword}
                                            </p>
                                        )}
                                    </div>

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
                                        {errors.newPassword && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.newPassword}
                                            </p>
                                        )}
                                    </div>

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
                                        {errors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            <li className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${passwordData.newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                At least 6 characters
                                            </li>
                                            <li className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                One uppercase letter
                                            </li>
                                            <li className="flex items-center">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                One number
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading 
                                            ? 'bg-blue-800 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
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

                {/* PERBAIKAN: Danger Zone dengan validasi */}
                <div className="mt-8 bg-red-900/10 border border-red-700/30 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center">
                        <AlertCircle className="h-6 w-6 mr-3" />
                        Danger Zone
                    </h3>
                    
                    <div className="space-y-4">
                        <p className="text-gray-400">
                            Once you delete your account, there is no going back. All your data including favorites, watchlists, and profile information will be permanently deleted.
                        </p>
                        
                        {/* PERBAIKAN: Admin tidak bisa hapus akun default */}
                        {user.email === 'admin@ronco.com' ? (
                            <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                                <p className="text-yellow-300">
                                    <strong>Note:</strong> Default admin account cannot be deleted. This is a system account.
                                </p>
                            </div>
                        ) : (
                            <>
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        <span>Delete My Account</span>
                                    </button>
                                ) : (
                                    <div className="p-4 bg-gray-900/50 rounded-lg border border-red-700/50">
                                        <h4 className="text-lg font-semibold mb-2 text-white">Are you absolutely sure?</h4>
                                        <p className="text-gray-400 mb-4">
                                            This action cannot be undone. Please type <strong>"DELETE"</strong> exactly to confirm.
                                        </p>
                                        
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder='Type "DELETE" to confirm'
                                                value={deleteConfirmationText}
                                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={loading || deleteConfirmationText !== 'DELETE'}
                                                    className={`px-6 py-2 rounded-lg transition-colors ${deleteConfirmationText === 'DELETE' 
                                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                        : 'bg-red-800/50 text-red-300 cursor-not-allowed'}`}
                                                >
                                                    {loading ? 'Deleting...' : 'Yes, Delete Account'}
                                                </button>
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