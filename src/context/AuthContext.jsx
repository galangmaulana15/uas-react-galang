import React, { createContext, useState, useContext, useEffect } from 'react';

// ================================
// CREATE AUTH CONTEXT
// ================================
const AuthContext = createContext();

// Custom hook untuk mengakses context
export const useAuth = () => useContext(AuthContext);

// ================================
// AUTH PROVIDER COMPONENT
// ================================
export const AuthProvider = ({ children }) => {
    // ================================
    // STATE MANAGEMENT
    // ================================
    const [user, setUser] = useState(null);      // State untuk user yang login
    const [loading, setLoading] = useState(true); // State untuk loading status

    // ================================
    // EFFECT UNTUK CHECK LOGIN STATE
    // ================================
    useEffect(() => {
        // Check localStorage untuk user saat komponen mount
        const savedUser = localStorage.getItem('roncomovie_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('roncomovie_user'); // Hapus data corrupt
            }
        }
        setLoading(false);
    }, []);

    // ================================
    // HELPER FUNCTIONS
    // ================================
    
    // Helper untuk mendapatkan key favorites berdasarkan user ID
    const getUserFavoritesKey = (userId) => `roncomovie_favorites_${userId}`;

    // ================================
    // AUTHENTICATION FUNCTIONS
    // ================================
    
    // Fungsi login
    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // PERBAIKAN: Email case-insensitive comparison
                const normalizedEmail = email.toLowerCase().trim();
                
                // Admin account
                if (normalizedEmail === 'admin@ronco.com' && password === 'admin123') {
                    const userData = {
                        id: 'admin_001',
                        email: normalizedEmail,
                        name: 'Admin Ronco',
                        role: 'admin',
                        joinedDate: new Date().toISOString(),
                        avatar: '👑',
                        _isAdmin: true
                    };
                    
                    setUser(userData);
                    localStorage.setItem('roncomovie_user', JSON.stringify(userData));
                    resolve({ success: true, user: userData });
                }
                // Check for existing users
                else {
                    const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                    // PERBAIKAN: Case-insensitive email comparison
                    const existingUser = users.find(u => 
                        u.email.toLowerCase() === normalizedEmail && u.password === password
                    );
                    
                    if (existingUser) {
                        // Remove password from user object in state
                        const { password: _, ...userWithoutPassword } = existingUser;
                        
                        setUser(userWithoutPassword);
                        localStorage.setItem('roncomovie_user', JSON.stringify(userWithoutPassword));
                        resolve({ success: true, user: userWithoutPassword });
                    } else {
                        reject({ success: false, message: 'Invalid email or password' });
                    }
                }
            }, 1000);
        });
    };

    // Fungsi register
    const register = (email, password, name) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // PERBAIKAN: Normalize email
                const normalizedEmail = email.toLowerCase().trim();
                const normalizedName = name.trim();
                
                // Check if user already exists
                const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                // PERBAIKAN: Case-insensitive check
                const userExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
                
                if (userExists) {
                    reject({ success: false, message: 'Email already registered' });
                    return;
                }
                
                // Create new user
                const userId = 'user_' + Date.now();
                const newUser = {
                    id: userId,
                    email: normalizedEmail,
                    password, // PERBAIKAN: Password harus di-hash di production
                    name: normalizedName,
                    role: 'user',
                    joinedDate: new Date().toISOString(),
                    profile: {
                        avatar: '👤',
                        bio: '',
                        favoriteGenres: [],
                        watchTime: 0,
                        totalMoviesWatched: 0
                    }
                };
                
                // Save to users list
                users.push(newUser);
                localStorage.setItem('roncomovie_users', JSON.stringify(users));
                
                // Initialize user-specific favorites
                localStorage.setItem(getUserFavoritesKey(userId), JSON.stringify([]));
                
                // Login the new user (remove password from state)
                const { password: _, ...userWithoutPassword } = newUser;
                
                setUser(userWithoutPassword);
                localStorage.setItem('roncomovie_user', JSON.stringify(userWithoutPassword));
                
                resolve({ success: true, user: userWithoutPassword });
            }, 1000);
        });
    };

    // Fungsi logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('roncomovie_user');
    };

    // Fungsi update profile
    const updateProfile = (updatedData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (!user) {
                        reject({ success: false, message: 'User not logged in' });
                        return;
                    }

                    // Update in current user (without password)
                    const updatedUser = { 
                        ...user, 
                        ...updatedData,
                        id: user.id // Pastikan ID tidak berubah
                    };
                    
                    setUser(updatedUser);
                    localStorage.setItem('roncomovie_user', JSON.stringify(updatedUser));
                    
                    // Update in users list (with password)
                    const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                    const userIndex = users.findIndex(u => u.id === user.id);
                    
                    if (userIndex !== -1) {
                        // PERBAIKAN: Jangan timpa password dengan updatedData
                        const { password: currentPassword } = users[userIndex];
                        const updatedUserWithPassword = {
                            ...users[userIndex],
                            ...updatedData,
                            password: currentPassword // Pertahankan password
                        };
                        
                        users[userIndex] = updatedUserWithPassword;
                        localStorage.setItem('roncomovie_users', JSON.stringify(users));
                    }
                    
                    resolve({ success: true, user: updatedUser });
                } catch (error) {
                    reject({ success: false, message: 'Failed to update profile' });
                }
            }, 500);
        });
    };

    // Fungsi delete account
    const deleteAccount = (confirmationText = '') => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (!user) {
                        reject({ success: false, message: 'User not logged in' });
                        return;
                    }

                    // Validasi konfirmasi
                    if (confirmationText !== 'DELETE') {
                        reject({ success: false, message: 'Confirmation text must be exactly "DELETE"' });
                        return;
                    }

                    // Untuk admin, jangan hapus akun admin default
                    if (user.email === 'admin@ronco.com') {
                        reject({ success: false, message: 'Cannot delete default admin account' });
                        return;
                    }

                    // Remove from users list
                    const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                    const filteredUsers = users.filter(u => u.id !== user.id);
                    localStorage.setItem('roncomovie_users', JSON.stringify(filteredUsers));
                    
                    // Remove user-specific data
                    localStorage.removeItem(getUserFavoritesKey(user.id));
                    localStorage.removeItem(`roncomovie_watchlist_${user.id}`);
                    localStorage.removeItem(`roncomovie_reviews_${user.id}`);
                    
                    // Logout
                    setUser(null);
                    localStorage.removeItem('roncomovie_user');
                    
                    resolve({ success: true, message: 'Account deleted successfully' });
                } catch (error) {
                    reject({ success: false, message: 'Failed to delete account' });
                }
            }, 1000);
        });
    };

    // ================================
    // FAVORITES MANAGEMENT
    // ================================
    
    // Mendapatkan daftar favorites user
    const getUserFavorites = () => {
        if (!user) return [];
        const key = getUserFavoritesKey(user.id);
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            console.error('Error parsing favorites:', error);
            return [];
        }
    };

    // Menambahkan movie ke favorites
    const addToFavorites = (movie) => {
        if (!user) return false;
        
        try {
            const favorites = getUserFavorites();
            
            // Check if already in favorites
            const exists = favorites.some(fav => fav.id === movie.id);
            if (exists) return true;
            
            // Add to favorites dengan user info
            const movieWithUserData = {
                ...movie,
                addedAt: new Date().toISOString(),
                userId: user.id,
                userName: user.name,
                userEmail: user.email
            };
            
            const updatedFavorites = [...favorites, movieWithUserData];
            const key = getUserFavoritesKey(user.id);
            localStorage.setItem(key, JSON.stringify(updatedFavorites));
            
            return true;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    };

    // Menghapus movie dari favorites
    const removeFromFavorites = (movieId) => {
        if (!user) return false;
        
        try {
            const favorites = getUserFavorites();
            const updatedFavorites = favorites.filter(movie => movie.id !== movieId);
            const key = getUserFavoritesKey(user.id);
            localStorage.setItem(key, JSON.stringify(updatedFavorites));
            
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    };

    // Mengecek apakah movie ada di favorites
    const isMovieInFavorites = (movieId) => {
        if (!user) return false;
        const favorites = getUserFavorites();
        return favorites.some(movie => movie.id === movieId);
    };

    // ================================
    // ADMIN FUNCTIONS
    // ================================
    
    // Mengecek apakah movie adalah user movie
    const isUserMovie = (movieId) => {
        const userMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
        // PERBAIKAN: Ganti == dengan ===
        return userMovies.some(movie => movie.id === movieId);
    };

    // Menghapus user movie
    const deleteUserMovie = (movieId) => {
        try {
            const userMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
            const movieToDelete = userMovies.find(m => m.id === movieId); // PERBAIKAN: ===
            
            if (!movieToDelete) {
                return { success: false, message: 'Movie not found' };
            }

            const updatedMovies = userMovies.filter(movie => movie.id !== movieId);
            localStorage.setItem('user_movies', JSON.stringify(updatedMovies));
            
            return { success: true, message: 'Movie deleted successfully', movie: movieToDelete };
        } catch (error) {
            return { success: false, message: 'Failed to delete movie' };
        }
    };

    // Update user movie
    const updateUserMovie = (movieId, updatedData) => {
        try {
            const userMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
            const movieIndex = userMovies.findIndex(m => m.id === movieId); // PERBAIKAN: ===
            
            if (movieIndex === -1) {
                return { success: false, message: 'Movie not found' };
            }

            userMovies[movieIndex] = { ...userMovies[movieIndex], ...updatedData };
            localStorage.setItem('user_movies', JSON.stringify(userMovies));
            
            return { success: true, message: 'Movie updated successfully', movie: userMovies[movieIndex] };
        } catch (error) {
            return { success: false, message: 'Failed to update movie' };
        }
    };

    // ================================
    // PASSWORD MANAGEMENT
    // ================================
    
    // Fungsi change password
    const changePassword = (currentPassword, newPassword) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!user) {
                    reject({ success: false, message: 'User not logged in' });
                    return;
                }

                // For admin account
                if (user.email === 'admin@ronco.com') {
                    if (currentPassword !== 'admin123') {
                        reject({ success: false, message: 'Current password is incorrect' });
                        return;
                    }
                    
                    // Update admin password (in a real app, this would be hashed)
                    const updatedUser = { 
                        ...user, 
                        _passwordUpdated: new Date().toISOString()
                    };
                    
                    setUser(updatedUser);
                    localStorage.setItem('roncomovie_user', JSON.stringify(updatedUser));
                    resolve({ success: true, message: 'Password changed successfully' });
                    return;
                }

                // For regular users
                const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                const userIndex = users.findIndex(u => u.id === user.id);
                
                if (userIndex === -1) {
                    reject({ success: false, message: 'User not found' });
                    return;
                }
                
                if (users[userIndex].password !== currentPassword) {
                    reject({ success: false, message: 'Current password is incorrect' });
                    return;
                }
                
                // Update password
                users[userIndex].password = newPassword;
                users[userIndex].passwordUpdatedAt = new Date().toISOString();
                localStorage.setItem('roncomovie_users', JSON.stringify(users));
                
                resolve({ success: true, message: 'Password changed successfully' });
            }, 1000);
        });
    };

    // ================================
    // CONTEXT VALUE
    // ================================
    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        changePassword,
        getUserFavorites,
        addToFavorites,
        removeFromFavorites,
        isMovieInFavorites,
        isUserMovie,
        deleteUserMovie,
        updateUserMovie,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};