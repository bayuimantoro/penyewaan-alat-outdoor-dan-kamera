'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaksi, DetailTransaksi } from '@/types';
import { mockTransaksi as initialTransaksi, mockDetailTransaksi as initialDetails } from '@/lib/mock-data';

interface TransactionContextType {
    transactions: Transaksi[];
    transactionDetails: DetailTransaksi[];
    updateTransactionStatus: (id: number, status: Transaksi['status']) => void;
    addTransaction: (transaction: Transaksi, details: DetailTransaksi[]) => void;
    deleteTransaction: (id: number) => void;
    getTransactionDetails: (transaksiId: number) => DetailTransaksi[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaksi[]>([]);
    const [transactionDetails, setTransactionDetails] = useState<DetailTransaksi[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load transactions from localStorage on mount
    useEffect(() => {
        const savedTransactions = localStorage.getItem('rental_transactions');
        const savedDetails = localStorage.getItem('rental_transaction_details');

        if (savedTransactions) {
            try {
                setTransactions(JSON.parse(savedTransactions));
            } catch (e) {
                console.error('Failed to parse transactions from localStorage');
                setTransactions(initialTransaksi);
            }
        } else {
            setTransactions(initialTransaksi);
        }

        if (savedDetails) {
            try {
                setTransactionDetails(JSON.parse(savedDetails));
            } catch (e) {
                console.error('Failed to parse transaction details from localStorage');
                setTransactionDetails(initialDetails);
            }
        } else {
            setTransactionDetails(initialDetails);
        }

        setIsLoaded(true);
    }, []);

    // Auto-update: sedang_disewa → menunggu_pengembalian when rental period ends
    useEffect(() => {
        if (!isLoaded) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        let hasUpdates = false;
        const updatedTransactions = transactions.map(trx => {
            // Only check transactions that are "sedang_disewa"
            if (trx.status === 'sedang_disewa') {
                const endDate = new Date(trx.tanggalSelesai);
                endDate.setHours(23, 59, 59, 999); // End of the rental day

                // If rental period has ended, change to menunggu_pengembalian
                if (today > endDate) {
                    hasUpdates = true;
                    return { ...trx, status: 'menunggu_pengembalian' as const };
                }
            }
            return trx;
        });

        // Only update state if there were changes
        if (hasUpdates) {
            setTransactions(updatedTransactions);
        }
    }, [isLoaded, transactions]);

    // Save transactions to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rental_transactions', JSON.stringify(transactions));
            localStorage.setItem('rental_transaction_details', JSON.stringify(transactionDetails));
        }
    }, [transactions, transactionDetails, isLoaded]);

    const updateTransactionStatus = (id: number, status: Transaksi['status']) => {
        setTransactions(prev =>
            prev.map(trx =>
                trx.id === id ? { ...trx, status } : trx
            )
        );
    };

    const addTransaction = (transaction: Transaksi, details: DetailTransaksi[]) => {
        setTransactions(prev => [transaction, ...prev]);
        setTransactionDetails(prev => [...details, ...prev]);
    };

    const deleteTransaction = (id: number) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        setTransactionDetails(prev => prev.filter(d => d.transaksiId !== id));
    };

    const getTransactionDetails = (transaksiId: number): DetailTransaksi[] => {
        return transactionDetails.filter(d => d.transaksiId === transaksiId);
    };

    return (
        <TransactionContext.Provider value={{
            transactions,
            transactionDetails,
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
