'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaksi, DetailTransaksi } from '@/types';

interface TransactionContextType {
    transactions: Transaksi[];
    transactionDetails: DetailTransaksi[];
    isLoading: boolean;
    refreshTransactions: () => Promise<void>;
    updateTransactionStatus: (id: number, status: Transaksi['status'], denda?: number) => Promise<boolean>;
    addTransaction: (transaction: Omit<Transaksi, 'id'>, details: Omit<DetailTransaksi, 'id' | 'transaksiId'>[]) => Promise<number | null>;
    deleteTransaction: (id: number) => Promise<boolean>;
    getTransactionDetails: (transaksiId: number) => DetailTransaksi[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaksi[]>([]);
    const [transactionDetails, setTransactionDetails] = useState<DetailTransaksi[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch transactions from API
    const refreshTransactions = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const response = await fetch('/api/transaksi');
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transaksi);
                setTransactionDetails(data.detailTransaksi);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []);

    // Load on mount and poll every 15 seconds (safe interval)
    useEffect(() => {
        refreshTransactions();

        const intervalId = setInterval(() => {
            refreshTransactions(true); // Silent refresh
        }, 15000);

        return () => clearInterval(intervalId);
    }, [refreshTransactions]);

    // Auto-update: sedang_disewa → menunggu_pengembalian when rental period ends
    useEffect(() => {
        if (isLoading || transactions.length === 0) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        transactions.forEach(async trx => {
            if (trx.status === 'sedang_disewa') {
                const endDate = new Date(trx.tanggalSelesai);
                endDate.setHours(23, 59, 59, 999);

                if (today > endDate) {
                    await updateTransactionStatus(trx.id, 'menunggu_pengembalian');
                }
            }
        });
    }, [isLoading, transactions]);

    const updateTransactionStatus = async (id: number, status: Transaksi['status'], denda?: number): Promise<boolean> => {
        try {
            const response = await fetch('/api/transaksi', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, denda })
            });
            const data = await response.json();
            if (data.success) {
                setTransactions(prev =>
                    prev.map(trx =>
                        trx.id === id ? { ...trx, status, denda: denda ?? trx.denda } : trx
                    )
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating transaction status:', error);
            return false;
        }
    };

    const addTransaction = async (
        transaction: Omit<Transaksi, 'id'>,
        details: Omit<DetailTransaksi, 'id' | 'transaksiId'>[]
    ): Promise<number | null> => {
        try {
            const response = await fetch('/api/transaksi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...transaction,
                    details
                })
            });
            const data = await response.json();
            if (data.success) {
                await refreshTransactions();
                return data.transaksiId;
            }
            return null;
        } catch (error) {
            console.error('Error adding transaction:', error);
            return null;
        }
    };

    const deleteTransaction = async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`/api/transaksi?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setTransactions(prev => prev.filter(t => t.id !== id));
                setTransactionDetails(prev => prev.filter(d => d.transaksiId !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return false;
        }
    };

    const getTransactionDetails = (transaksiId: number): DetailTransaksi[] => {
        return transactionDetails.filter(d => d.transaksiId === transaksiId);
    };

    return (
        <TransactionContext.Provider value={{
            transactions,
            transactionDetails,
            isLoading,
            refreshTransactions,
            updateTransactionStatus,
            addTransaction,
            deleteTransaction,
            getTransactionDetails
        }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
}
