'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TransactionProvider } from '@/lib/transaction-context';
import { UserProvider } from '@/lib/user-context';
import { BarangProvider } from '@/lib/barang-context';
import { useAuth } from '@/lib/auth-context';

export default function GudangLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useAuth();
    const userName = currentUser?.nama || 'Gudang';

    return (
        <UserProvider>
            <TransactionProvider>
                <BarangProvider>
                    <div style={{ display: 'flex', minHeight: '100vh' }}>
                        <Sidebar role="gudang" userName={userName} />
                        <main className="main-content">
                            {children}
                        </main>
                    </div>
                </BarangProvider>
            </TransactionProvider>
        </UserProvider>
    );
}
