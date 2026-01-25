'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SessionUser {
    id: number;
    nama: string;
    email: string;
    noHp: string;
    alamat: string;
    role: 'admin' | 'gudang' | 'member';
    statusVerifikasi: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface SessionContextType {
    currentUser: SessionUser | null;
    isLoading: boolean;
    refreshSession: () => Promise<void>;
    logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSession = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (data.success && data.user) {
                setCurrentUser(data.user);
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            console.error('Failed to refresh session:', error);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Fetch session on mount
    useEffect(() => {
        refreshSession();
    }, []);

    return (
        <SessionContext.Provider value={{ currentUser, isLoading, refreshSession, logout }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}
