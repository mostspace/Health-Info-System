import { store } from '../../store';
import { setUser, setLoading } from './authSlice';

export const initializeAuth = async () => {
    try {
        // Check if user is logged in (e.g., from localStorage)
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            const user = JSON.parse(userData);
            store.dispatch(setUser(user));
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
    } finally {
        store.dispatch(setLoading(false));
    }
}; 