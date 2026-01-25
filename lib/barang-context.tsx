'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Barang, StatusBarang, DetailTransaksi } from '@/types';

interface BarangContextType {
    barang: Barang[];
    isLoading: boolean;
    refreshBarang: () => Promise<void>;
    addBarang: (item: Omit<Barang, 'id'>) => Promise<boolean>;
    updateBarang: (id: number, data: Partial<Barang>) => Promise<boolean>;
    updateBarangStatus: (id: number, status: StatusBarang) => Promise<boolean>;
    deleteBarang: (id: number) => Promise<boolean>;
    getBarangById: (id: number) => Barang | undefined;
    // Stock management
    decreaseStock: (barangId: number, qty: number) => Promise<boolean>;
    increaseStock: (barangId: number, qty: number) => Promise<boolean>;
    processCheckout: (details: DetailTransaksi[]) => Promise<boolean>;
    processReturn: (details: DetailTransaksi[]) => Promise<boolean>;
}

const BarangContext = createContext<BarangContextType | undefined>(undefined);

export function BarangProvider({ children }: { children: ReactNode }) {
    const [barang, setBarang] = useState<Barang[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch barang from API
    const refreshBarang = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/barang');
            const data = await response.json();
            if (data.success) {
                setBarang(data.barang);
            }
        } catch (error) {
            console.error('Error fetching barang:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        refreshBarang();
    }, [refreshBarang]);

    const addBarang = async (item: Omit<Barang, 'id'>): Promise<boolean> => {
        try {
            const response = await fetch('/api/barang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            const data = await response.json();
            if (data.success) {
                await refreshBarang();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding barang:', error);
            return false;
        }
    };

    const updateBarang = async (id: number, data: Partial<Barang>): Promise<boolean> => {
        try {
            const response = await fetch('/api/barang', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            });
            const result = await response.json();
            if (result.success) {
                await refreshBarang();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating barang:', error);
            return false;
        }
    };

    const updateBarangStatus = async (id: number, status: StatusBarang): Promise<boolean> => {
        return updateBarang(id, { status });
    };

    const deleteBarang = async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`/api/barang?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setBarang(prev => prev.filter(b => b.id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting barang:', error);
            return false;
        }
    };

    const getBarangById = (id: number): Barang | undefined => {
        return barang.find(b => b.id === id);
    };

    // Decrease stock when items are handed over to member
    const decreaseStock = async (barangId: number, qty: number): Promise<boolean> => {
        try {
            const response = await fetch('/api/barang/stock', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: barangId, action: 'decrease', qty })
            });
            const data = await response.json();
            if (data.success) {
                // Update local state
                setBarang(prev => prev.map(b => {
                    if (b.id === barangId) {
                        return { ...b, stok: data.newStok, status: data.newStatus };
                    }
                    return b;
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error decreasing stock:', error);
            return false;
        }
    };

    // Increase stock when items are returned
    const increaseStock = async (barangId: number, qty: number): Promise<boolean> => {
        try {
            const response = await fetch('/api/barang/stock', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: barangId, action: 'increase', qty })
            });
            const data = await response.json();
            if (data.success) {
                setBarang(prev => prev.map(b => {
                    if (b.id === barangId) {
                        return { ...b, stok: data.newStok, status: data.newStatus };
                    }
                    return b;
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error increasing stock:', error);
            return false;
        }
    };

    // Process multiple items at checkout
    const processCheckout = async (details: DetailTransaksi[]): Promise<boolean> => {
        try {
            for (const detail of details) {
                await decreaseStock(detail.barangId, detail.qty);
            }
            return true;
        } catch (error) {
            console.error('Error processing checkout:', error);
            return false;
        }
    };

    // Process multiple items at return
    const processReturn = async (details: DetailTransaksi[]): Promise<boolean> => {
        try {
            for (const detail of details) {
                await increaseStock(detail.barangId, detail.qty);
            }
            return true;
        } catch (error) {
            console.error('Error processing return:', error);
            return false;
        }
    };

    return (
        <BarangContext.Provider value={{
            barang,
            isLoading,
            refreshBarang,
            addBarang,
            updateBarang,
            updateBarangStatus,
            deleteBarang,
            getBarangById,
            decreaseStock,
            increaseStock,
            processCheckout,
            processReturn
        }}>
            {children}
        </BarangContext.Provider>
    );
}

export function useBarang() {
    const context = useContext(BarangContext);
    if (!context) {
        throw new Error('useBarang must be used within a BarangProvider');
    }
    return context;
}
