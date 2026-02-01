'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Promo } from '@/types';

interface PromoContextType {
    promos: Promo[];
    isLoading: boolean;
    refreshPromos: () => Promise<void>;
    addPromo: (promo: Omit<Promo, 'id' | 'createdAt'>) => Promise<boolean>;
    updatePromo: (id: number, data: Partial<Promo>) => Promise<boolean>;
    togglePromoStatus: (id: number) => Promise<boolean>;
    deletePromo: (id: number) => Promise<boolean>;
    getPromoByKode: (kode: string) => Promise<Promo | null>;
    getApplicablePromo: (subtotal: number) => { promo: Promo; discountAmount: number } | null;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export function PromoProvider({ children }: { children: ReactNode }) {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch promos from API
    const refreshPromos = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/promo');
            const data = await response.json();
            if (data.success) {
                setPromos(data.promos);
            }
        } catch (error) {
            console.error('Error fetching promos:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load on mount
    useEffect(() => {
        refreshPromos();
    }, [refreshPromos]);

    const addPromo = async (promo: Omit<Promo, 'id' | 'createdAt'>): Promise<boolean> => {
        try {
            const response = await fetch('/api/promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promo)
            });
            const data = await response.json();
            if (data.success) {
                await refreshPromos();
                return true;
            }
            alert(data.message || 'Gagal menambah promo');
            return false;
        } catch (error) {
            console.error('Error adding promo:', error);
            return false;
        }
    };

    const updatePromo = async (id: number, data: Partial<Promo>): Promise<boolean> => {
        try {
            const response = await fetch('/api/promo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            });
            const result = await response.json();
            if (result.success) {
                await refreshPromos();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating promo:', error);
            return false;
        }
    };

    const togglePromoStatus = async (id: number): Promise<boolean> => {
        const promo = promos.find(p => p.id === id);
        if (!promo) return false;

        const newStatus = promo.status === 'aktif' ? 'nonaktif' : 'aktif';
        return updatePromo(id, { status: newStatus });
    };

    const deletePromo = async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`/api/promo?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                setPromos(prev => prev.filter(p => p.id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting promo:', error);
            return false;
        }
    };

    const getPromoByKode = async (kode: string): Promise<Promo | null> => {
        try {
            const response = await fetch(`/api/promo?kode=${kode.toUpperCase()}`);
            const data = await response.json();
            if (data.success) {
                return data.promo;
            }
            return null;
        } catch (error) {
            console.error('Error getting promo by kode:', error);
            return null;
        }
    };

    // Get applicable promo based on subtotal (auto-apply)
    const getApplicablePromo = (subtotal: number): { promo: Promo; discountAmount: number } | null => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all valid promos for this subtotal
        const validPromos = promos.filter(p => {
            // Must be active
            if (p.status !== 'aktif') return false;

            // Check date range
            const startDate = new Date(p.tanggalMulai);
            const endDate = new Date(p.tanggalSelesai);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            if (today < startDate || today > endDate) return false;

            // Check minimum transaction
            if (subtotal < p.minTransaksi) return false;

            return true;
        });

        if (validPromos.length === 0) return null;

        // Calculate discount for each valid promo and find the best one
        let bestPromo: Promo | null = null;
        let bestDiscount = 0;

        for (const promo of validPromos) {
            let discount = 0;

            if (promo.tipeDiskon === 'persentase') {
                discount = (subtotal * promo.nilaiDiskon) / 100;
                // Apply max discount cap if set
                if (promo.maxDiskon && promo.maxDiskon > 0 && discount > promo.maxDiskon) {
                    discount = promo.maxDiskon;
                }
            } else {
                // Nominal discount
                discount = promo.nilaiDiskon;
            }

            if (discount > bestDiscount) {
                bestDiscount = discount;
                bestPromo = promo;
            }
        }

        if (bestPromo && bestDiscount > 0) {
            return { promo: bestPromo, discountAmount: bestDiscount };
        }

        return null;
    };

    return (
        <PromoContext.Provider value={{
            promos,
            isLoading,
            refreshPromos,
            addPromo,
            updatePromo,
            togglePromoStatus,
            deletePromo,
            getPromoByKode,
            getApplicablePromo
        }}>
            {children}
        </PromoContext.Provider>
    );
}

export function usePromos() {
    const context = useContext(PromoContext);
    if (!context) {
        throw new Error('usePromos must be used within a PromoProvider');
    }
    return context;
}
