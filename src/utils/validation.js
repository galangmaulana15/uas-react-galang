export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateMovieForm = (data) => {
    const errors = {};
    
    if (!data.title?.trim()) errors.title = 'Title is required';
    if (!data.description?.trim()) errors.description = 'Description is required';
    if (!data.rating || data.rating < 0 || data.rating > 10) errors.rating = 'Rating must be between 0-10';
    if (!data.releaseDate) errors.releaseDate = 'Release date is required';
    
    return errors;
};

export const validateLogin = (email, password) => {
    const errors = {};
    
    if (!validateEmail(email)) errors.email = 'Invalid email format';
    if (!validatePassword(password)) errors.password = 'Password must be at least 6 characters';
    
    return errors;
};

export const validateRegister = (email, password, confirmPassword) => {
    const errors = validateLogin(email, password);
    
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    return errors;
};