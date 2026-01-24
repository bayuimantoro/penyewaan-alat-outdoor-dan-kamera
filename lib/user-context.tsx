'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StatusVerifikasi } from '@/types';
import { mockUsers as initialUsers } from '@/lib/mock-data';

interface UserContextType {
    users: User[];
    updateUserStatus: (id: number, status: StatusVerifikasi) => void;
    addUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load users from localStorage on mount
    useEffect(() => {
        const savedUsers = localStorage.getItem('rental_users');
        if (savedUsers) {
            try {
                setUsers(JSON.parse(savedUsers));
            } catch (e) {
                console.error('Failed to parse users from localStorage');
                setUsers(initialUsers);
            }
        } else {
            setUsers(initialUsers);
        }
        setIsLoaded(true);
    }, []);

    // Save users to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rental_users', JSON.stringify(users));
        }
    }, [users, isLoaded]);

    const updateUserStatus = (id: number, status: StatusVerifikasi) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === id ? { ...user, statusVerifikasi: status } : user
            )
        );
    };

    const addUser = (user: User) => {
        setUsers(prev => [...prev, user]);
    };

    return (
        <UserContext.Provider value={{ users, updateUserStatus, addUser }}>
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
