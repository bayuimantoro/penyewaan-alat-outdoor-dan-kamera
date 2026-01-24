'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RegisteredUser {
    id: number;
    nama: string;
    email: string;
    password: string; // Stored as plain text for demo (in real app, use hashing)
    noHp: string;
    alamat: string;
    role: 'admin' | 'gudang' | 'member';
    statusVerifikasi: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface AuthContextType {
    currentUser: RegisteredUser | null;
    registeredUsers: RegisteredUser[];
    registerUser: (userData: Omit<RegisteredUser, 'id' | 'role' | 'statusVerifikasi' | 'createdAt'>) => { success: boolean; message: string };
    loginUser: (email: string, password: string) => { success: boolean; message: string; role?: string };
    logoutUser: () => void;
    updateUserStatus: (userId: number, status: 'pending' | 'approved' | 'rejected') => void;
    deleteUser: (userId: number) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo users with passwords
const defaultUsers: RegisteredUser[] = [
    {
        id: 1,
        nama: 'Admin User',
        email: 'admin@rentalgear.com',
        password: 'admin123',
        noHp: '08123456789',
        alamat: 'Jakarta',
        role: 'admin',
        statusVerifikasi: 'approved',
        createdAt: '2024-01-01',
    },
    {
        id: 2,
        nama: 'Gudang User',
        email: 'gudang@rentalgear.com',
        password: 'gudang123',
        noHp: '08123456790',
        alamat: 'Jakarta',
        role: 'gudang',
        statusVerifikasi: 'approved',
        createdAt: '2024-01-01',
    },
    {
        id: 3,
        nama: 'Demo Member',
        email: 'member@gmail.com',
        password: 'member123',
        noHp: '08123456791',
        alamat: 'Jakarta',
        role: 'member',
        statusVerifikasi: 'approved',
        createdAt: '2024-01-01',
    },
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
    const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedUsers = localStorage.getItem('rental_auth_users');
        const savedCurrentUser = localStorage.getItem('rental_current_user');

        if (savedUsers) {
            try {
                setRegisteredUsers(JSON.parse(savedUsers));
            } catch {
                setRegisteredUsers(defaultUsers);
            }
        } else {
            setRegisteredUsers(defaultUsers);
        }

        if (savedCurrentUser) {
            try {
                setCurrentUser(JSON.parse(savedCurrentUser));
            } catch {
                setCurrentUser(null);
            }
        }

        setIsLoaded(true);
    }, []);

    // Save to localStorage when users change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rental_auth_users', JSON.stringify(registeredUsers));
        }
    }, [registeredUsers, isLoaded]);

    // Save current user to localStorage
    useEffect(() => {
        if (isLoaded) {
            if (currentUser) {
                localStorage.setItem('rental_current_user', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('rental_current_user');
            }
        }
    }, [currentUser, isLoaded]);

    const registerUser = (userData: Omit<RegisteredUser, 'id' | 'role' | 'statusVerifikasi' | 'createdAt'>) => {
        // Check if email already exists
        const existingUser = registeredUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            return { success: false, message: 'Email sudah terdaftar!' };
        }

        const newUser: RegisteredUser = {
            ...userData,
            id: Date.now(),
            role: 'member', // New registrations are always members
            statusVerifikasi: 'approved', // Auto-approve for demo purposes
            createdAt: new Date().toISOString().split('T')[0],
        };

        setRegisteredUsers(prev => [...prev, newUser]);
        return { success: true, message: 'Registrasi berhasil! Silakan login.' };
    };

    const loginUser = (email: string, password: string) => {
        const user = registeredUsers.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return { success: false, message: 'Email atau password salah!' };
        }

        if (user.statusVerifikasi === 'pending') {
            return { success: false, message: 'Akun Anda belum diverifikasi oleh admin.' };
        }

        if (user.statusVerifikasi === 'rejected') {
            return { success: false, message: 'Akun Anda ditolak. Silakan hubungi admin.' };
        }

        setCurrentUser(user);
        return { success: true, message: 'Login berhasil!', role: user.role };
    };

    const logoutUser = () => {
        setCurrentUser(null);
    };

    const updateUserStatus = (userId: number, status: 'pending' | 'approved' | 'rejected') => {
        setRegisteredUsers(prev =>
            prev.map(user =>
                user.id === userId ? { ...user, statusVerifikasi: status } : user
            )
        );
    };

    const deleteUser = (userId: number) => {
        setRegisteredUsers(prev => prev.filter(user => user.id !== userId));
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                registeredUsers,
                registerUser,
                loginUser,
                logoutUser,
                updateUserStatus,
                deleteUser,
                isAuthenticated: !!currentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
