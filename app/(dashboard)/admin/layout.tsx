'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TransactionProvider } from '@/lib/transaction-context';
import { UserProvider } from '@/lib/user-context';
import { BarangProvider } from '@/lib/barang-context';
import { PromoProvider } from '@/lib/promo-context';
import { useSession } from '@/lib/session-context';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser, isLoading } = useSession();
    const userName = currentUser?.nama || 'Admin';

    return (
        <UserProvider>
            <TransactionProvider>
                <BarangProvider>
                    <PromoProvider>
                        <div style={{ display: 'flex', minHeight: '100vh' }}>
                            <Sidebar role="admin" userName={userName} />
                            <main className="main-content">
                                {children}
                            </main>
                        </div>
                    </PromoProvider>
                </BarangProvider>
            </TransactionProvider>
        </UserProvider>
    );
}
