'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StatusVerifikasi } from '@/types';

interface UserContextType {
    users: User[];
    isLoading: boolean;
    updateUserStatus: (id: number, status: StatusVerifikasi) => Promise<boolean>;
    refreshUsers: () => Promise<void>;
    getUserById: (id: number) => User | undefined;
    getUserByEmail: (email: string) => User | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch users from database API
    const refreshUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/users');
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load users on mount
    useEffect(() => {
        refreshUsers();
    }, []);

    // Update user status via API
    const updateUserStatus = async (id: number, status: StatusVerifikasi): Promise<boolean> => {
        try {
            const response = await fetch('/api/admin/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, statusVerifikasi: status })
            });
            const result = await response.json();
            if (result.success) {
                await refreshUsers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating user status:', error);
            return false;
        }
    };

    // Get user by ID
    const getUserById = (id: number): User | undefined => {
        return users.find(u => u.id === id);
    };

    // Get user by email
    const getUserByEmail = (email: string): User | undefined => {
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    };

    return (
        <UserContext.Provider value={{
            users,
            isLoading,
            updateUserStatus,
            refreshUsers,
            getUserById,
            getUserByEmail
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUsers() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
}
