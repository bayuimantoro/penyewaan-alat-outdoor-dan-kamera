'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Barang } from '@/types';

export interface CartItem {
    barang: Barang;
    qty: number;
    tanggalMulai: string;
    tanggalSelesai: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, updates: Partial<CartItem>) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('rental_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from localStorage');
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rental_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (item: CartItem) => {
        // Check if item already exists
        const existingIndex = items.findIndex(
            i => i.barang.id === item.barang.id &&
                i.tanggalMulai === item.tanggalMulai &&
                i.tanggalSelesai === item.tanggalSelesai
        );

        if (existingIndex >= 0) {
            // Update qty if same item and dates
            setItems(prev => prev.map((i, idx) =>
                idx === existingIndex
                    ? { ...i, qty: i.qty + item.qty }
                    : i
            ));
        } else {
            setItems(prev => [...prev, item]);
        }
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, updates: Partial<CartItem>) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, ...updates } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
