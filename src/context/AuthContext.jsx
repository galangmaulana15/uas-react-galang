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
                        avatar: '👑'
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
                
                // Initialize user-specific storage
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
                        id: user.id // Ensure ID doesn't change
                    };
                    
                    setUser(updatedUser);
                    localStorage.setItem('roncomovie_user', JSON.stringify(updatedUser));
                    
                    // Update in users list
                    const users = JSON.parse(localStorage.getItem('roncomovie_users') || '[]');
                    const userIndex = users.findIndex(u => u.id === user.id);
                    
                    if (userIndex !== -1) {
                        // Keep password if not being updated
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

    const deleteAccount = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (!user) {
                        reject({ success: false, message: 'User not logged in' });
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
                    
                    resolve({ success: true });
                } catch (error) {
                    reject({ success: false, message: 'Failed to delete account' });
                }
            }, 1000);
        });
    };

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
            
            // Add to favorites
            const movieWithUserData = {
                ...movie,
                addedAt: new Date().toISOString(),
                userId: user.id
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

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        getUserFavorites,
        addToFavorites,
        removeFromFavorites,
        isMovieInFavorites,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};