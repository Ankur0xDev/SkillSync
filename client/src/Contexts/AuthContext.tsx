import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { User } from '../types';

// Set the base URL without the /api suffix since it's included in the routes
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://skillsync-hq3x.onrender.com/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Add request interceptor to include auth token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('skillsync_token');
        console.log('Request interceptor - Token:', token ? 'Present' : 'Missing');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log('Response interceptor - Error status:', error.response?.status);
        if (error.response?.status === 401) {
            console.log('401 error detected - logging out user');
            // Token is invalid or expired, logout the user
            localStorage.removeItem('skillsync_token');
            delete axios.defaults.headers.common['Authorization'];
            // Dispatch logout action if we're in the auth context
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'SET_LOADING', payload: boolean }
    | { type: 'LOGIN_SUCCESS', payload: { user: User, token: string } }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_USER', payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'LOGIN_SUCCESS':
            return { ...state, user: action.payload.user, token: action.payload.token, loading: false, isAuthenticated: true };
        case 'LOGOUT':
            return { ...state, user: null, token: null, isAuthenticated: false };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } };
        default:
            return state;
    }
};

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('skillsync_token'),
    loading: true,
    isAuthenticated: false
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const token = localStorage.getItem('skillsync_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            verifyToken();
        } else {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const verifyToken = async () => {
        try {
            console.log('Verifying token...');
            const response = await axios.get('/auth/verify');
            console.log('Token verification response:', response.data);
            if (response.data.user) {
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user: response.data.user,
                        token: localStorage.getItem('skillsync_token')!
                    }
                });
            } else {
                throw new Error('Invalid user data');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('skillsync_token');
            delete axios.defaults.headers.common['Authorization'];
            dispatch({ type: 'LOGOUT' });
        }
    };

    const login = async (email: string, password: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await axios.post('/auth/login', { email, password });
            const { user, token } = response.data;

            if (!user || !token) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('skillsync_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
            toast.success('Welcome back!');

        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', payload: false });
            const message = error.response?.data?.message || 'Login failed. Please check your connection.';
            toast.error(message);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            console.log(name, email, password);
            const response = await axios.post('/auth/register', { name, email, password });

            const { token, user } = response.data;
            localStorage.setItem('skillsync_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token }
            })

            toast.success('Account created successfully!');
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', payload: false });
            const message =
                typeof error.response?.data?.message === 'string'
                    ? error.response.data.message
                    : error.response?.data?.errors?.[0]?.msg || 'Registration failed. Please check your input.';

            toast.error(message);

            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('skillsync_token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch({ type: 'LOGOUT' });
        toast.success('Logged out successfully!');
    };

    const updateUser = (userData: Partial<User>) => {
        dispatch({
            type: 'UPDATE_USER',
            payload: userData as User
        })
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
};