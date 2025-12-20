import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, User, LogOut, Menu, X, Home, Star, Heart, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery);
            navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setUserDropdownOpen(false);
    };

    const navItems = [
        { path: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
        { path: '/movies', label: 'Movies', icon: <Film className="h-5 w-5" /> },
        { path: '/favorites', label: 'Favorites', icon: <Heart className="h-5 w-5" /> },
    ];

    if (user?.role === 'admin') {
        navItems.push(
            { path: '/add-movie', label: 'Add Movie', icon: <Plus className="h-5 w-5" /> },
            { path: '/admin/movies', label: 'Manage', icon: <Settings className="h-5 w-5" /> }
        );
    }

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-slate-900/95 backdrop-blur-lg border-b border-gray-800/50 shadow-2xl">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Film className="relative h-10 w-10 text-white z-10 transform group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                                RoncoMovie
                            </span>
                            <div className="text-xs text-gray-400 -mt-1">Unlimited Entertainment</div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 group/nav"
                            >
                                <div className="transform group-hover/nav:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Search and User Section */}
                    <div className="flex items-center space-x-4">
                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="relative hidden md:block">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors z-10" />
                                <input
                                    type="text"
                                    placeholder="Search movies, actors..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="relative pl-12 pr-4 py-2.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full w-64 focus:w-80 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1.5 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl z-10"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg z-10">
                                            {user.role === 'admin' ? '👑' : user.profile?.avatar || '👤'}
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="font-semibold text-white">{user.name}</div>
                                        <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                                    </div>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 py-2 animate-slideDown z-50">
                                        <div className="px-4 py-3 border-b border-gray-700/50">
                                            <div className="font-semibold text-white">{user.name}</div>
                                            <div className="text-sm text-gray-400">{user.email}</div>
                                        </div>
                                        
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                        >
                                            <User className="h-5 w-5" />
                                            <span>Profile Settings</span>
                                        </Link>
                                        
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                        >
                                            <Star className="h-5 w-5" />
                                            <span>My Dashboard</span>
                                        </Link>
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <Link
                                                    to="/admin/movies"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <Settings className="h-5 w-5" />
                                                    <span>Manage Movies</span>
                                                </Link>
                                                <Link
                                                    to="/add-movie"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    <span>Add New Movie</span>
                                                </Link>
                                            </>
                                        )}
                                        
                                        <div className="border-t border-gray-700/50 mt-2 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full transition-colors"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="hidden md:block px-6 py-2.5 border-2 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-full font-semibold transition-all duration-300"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 animate-fadeIn">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </form>
                        
                        {/* Mobile Navigation */}
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                            
                            {!user ? (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                    >
                                        <User className="h-5 w-5" />
                                        <span>Sign In</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-700 text-gray-300 hover:text-white rounded-xl transition-colors"
                                    >
                                        <span>Sign Up</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                                    >
                                        <User className="h-5 w-5" />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
            
            {/* Add CSS for animations */}
            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% auto;
                    animation: gradient-x 3s ease infinite;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-heartbeat {
                    animation: heartbeat 0.5s ease-in-out;
                }
            `}</style>
        </header>
    );
};

export default Header;