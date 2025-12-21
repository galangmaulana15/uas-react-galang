import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for user on mount
        const savedUser = localStorage.getItem('roncomovie_user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
        }
        setLoading(false);
    }, []);

    // Helper function to get user-specific favorites key
    const getUserFavoritesKey = (userId) => `roncomovie_favorites_${userId}`;

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Admin account
                if (email === 'admin@ronco.com' && password === 'admin123') {
                    const userData = {
                        id: 'admin_001',
                        email,
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
                    const existingUser = users.find(u => u.email === email && u.password === password);
                    
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

    const register = (email, password, name) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if user already exists
                const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                const userExists = users.some(u => u.email === email);
                
                if (userExists) {
                    reject({ success: false, message: 'Email already registered' });
                    return;
                }
                
                // Create new user
                const userId = 'user_' + Date.now();
                const newUser = {
                    id: userId,
                    email,
                    password,
                    name,
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
                
                // Login the new user
                const { password: _, ...userWithoutPassword } = newUser;
                
                setUser(userWithoutPassword);
                localStorage.setItem('roncomovie_user', JSON.stringify(userWithoutPassword));
                
                resolve({ success: true, user: userWithoutPassword });
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('roncomovie_user');
    };

    const updateProfile = (updatedData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (!user) {
                        reject({ success: false, message: 'User not logged in' });
                        return;
                    }

                    // Update in current user
                    const updatedUser = { 
                        ...user, 
                        ...updatedData,
                        id: user.id
                    };
                    
                    setUser(updatedUser);
                    localStorage.setItem('roncomovie_user', JSON.stringify(updatedUser));
                    
                    // Update in users list
                    const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                    const userIndex = users.findIndex(u => u.id === user.id);
                    
                    if (userIndex !== -1) {
                        const updatedUserWithPassword = {
                            ...users[userIndex],
                            ...updatedData
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

    // PERBAIKAN: Tambahkan validasi delete account
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

    // PERBAIKAN: Favorites system yang benar
    const getUserFavorites = () => {
        if (!user) return [];
        const key = getUserFavoritesKey(user.id);
        return JSON.parse(localStorage.getItem(key) || '[]');
    };

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

    const isMovieInFavorites = (movieId) => {
        if (!user) return false;
        const favorites = getUserFavorites();
        return favorites.some(movie => movie.id === movieId);
    };

    // PERBAIKAN: Tambahkan fungsi untuk admin
    const isUserMovie = (movieId) => {
        const userMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
        return userMovies.some(movie => movie.id == movieId);
    };

    const deleteUserMovie = (movieId) => {
        try {
            const userMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
            const movieToDelete = userMovies.find(m => m.id == movieId);
            
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

    const updateUserMovie = (movieId, updatedData) => {
        try {
            const userMovies = JSON.parse(localStorage.getItem('user_movies') || '[]');
            const movieIndex = userMovies.findIndex(m => m.id == movieId);
            
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

    // PERBAIKAN: Tambahkan changePassword function
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
                    
                    // Update admin password
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