'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { CartProvider } from '@/lib/cart-context';
import { TransactionProvider } from '@/lib/transaction-context';
import { BarangProvider } from '@/lib/barang-context';
import { PromoProvider } from '@/lib/promo-context';
import { useAuth } from '@/lib/auth-context';

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useAuth();
    const userName = currentUser?.nama || 'Member';

    return (
        <CartProvider>
            <TransactionProvider>
                <BarangProvider>
                    <PromoProvider>
                        <div style={{ display: 'flex', minHeight: '100vh' }}>
                            <Sidebar role="member" userName={userName} />
                            <main className="main-content">
                                {children}
                            </main>
                        </div>
                    </PromoProvider>
                </BarangProvider>
            </TransactionProvider>
        </CartProvider>
    );
}
