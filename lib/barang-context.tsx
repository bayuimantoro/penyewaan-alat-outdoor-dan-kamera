'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Barang, StatusBarang, DetailTransaksi } from '@/types';
import { mockBarang as initialBarang } from '@/lib/mock-data';

interface BarangContextType {
    barang: Barang[];
    addBarang: (item: Barang) => void;
    updateBarang: (id: number, data: Partial<Barang>) => void;
    updateBarangStatus: (id: number, status: StatusBarang) => void;
    deleteBarang: (id: number) => void;
    getBarangById: (id: number) => Barang | undefined;
    // Stock management - auto update status based on stock
    decreaseStock: (barangId: number, qty: number) => void;
    increaseStock: (barangId: number, qty: number) => void;
    processCheckout: (details: DetailTransaksi[]) => void;
    processReturn: (details: DetailTransaksi[]) => void;
}

const BarangContext = createContext<BarangContextType | undefined>(undefined);

export function BarangProvider({ children }: { children: ReactNode }) {
    const [barang, setBarang] = useState<Barang[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('rental_barang');
        if (saved) {
            try {
                setBarang(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse barang from localStorage');
                setBarang(initialBarang);
            }
        } else {
            setBarang(initialBarang);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rental_barang', JSON.stringify(barang));
        }
    }, [barang, isLoaded]);

    const addBarang = (item: Barang) => {
        setBarang(prev => [item, ...prev]);
    };

    const updateBarang = (id: number, data: Partial<Barang>) => {
        setBarang(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    };

    const updateBarangStatus = (id: number, status: StatusBarang) => {
        setBarang(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };

    const deleteBarang = (id: number) => {
        setBarang(prev => prev.filter(b => b.id !== id));
    };

    const getBarangById = (id: number): Barang | undefined => {
        return barang.find(b => b.id === id);
    };

    // Decrease stock when items are handed over to member
    const decreaseStock = (barangId: number, qty: number) => {
        setBarang(prev => prev.map(b => {
            if (b.id === barangId) {
                const newStock = Math.max(0, b.stok - qty);
                // Auto-update status based on remaining stock
                const newStatus: StatusBarang = newStock === 0 ? 'disewa' : b.status;
                return { ...b, stok: newStock, status: newStatus };
            }
            return b;
        }));
    };

    // Increase stock when items are returned
    const increaseStock = (barangId: number, qty: number) => {
        setBarang(prev => prev.map(b => {
            if (b.id === barangId) {
                const newStock = b.stok + qty;
                // Auto-update status back to tersedia if stock > 0 and was 'disewa'
                const newStatus: StatusBarang = (b.status === 'disewa' && newStock > 0) ? 'tersedia' : b.status;
                return { ...b, stok: newStock, status: newStatus };
            }
            return b;
        }));
    };

    // Process multiple items at checkout (when gudang hands over to member)
    const processCheckout = (details: DetailTransaksi[]) => {
        details.forEach(detail => {
            decreaseStock(detail.barangId, detail.qty);
        });
    };

    // Process multiple items at return (when member returns items)
    const processReturn = (details: DetailTransaksi[]) => {
        details.forEach(detail => {
            increaseStock(detail.barangId, detail.qty);
        });
    };

    return (
        <BarangContext.Provider value={{
            barang,
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
