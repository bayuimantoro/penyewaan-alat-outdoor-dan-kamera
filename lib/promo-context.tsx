'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Promo } from '@/types';

// Initial promo data
const initialPromos: Promo[] = [
    {
        id: 1,
        kode: 'NEWMEMBER',
        nama: 'Diskon Member Baru',
        deskripsi: 'Diskon 10% untuk member baru',
        tipeDiskon: 'persentase',
        nilaiDiskon: 10,
        minTransaksi: 100000,
        maxDiskon: 50000,
        tanggalMulai: '2026-01-01',
        tanggalSelesai: '2026-03-31',
        status: 'aktif',
        createdAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 2,
        kode: 'WEEKEND20',
        nama: 'Weekend Special',
        deskripsi: 'Diskon 20% untuk sewa weekend',
        tipeDiskon: 'persentase',
        nilaiDiskon: 20,
        minTransaksi: 200000,
        maxDiskon: 100000,
        tanggalMulai: '2026-01-01',
        tanggalSelesai: '2026-12-31',
        status: 'aktif',
        createdAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 3,
        kode: 'HEMAT50K',
        nama: 'Potongan 50 Ribu',
        deskripsi: 'Potongan langsung Rp 50.000',
        tipeDiskon: 'nominal',
        nilaiDiskon: 50000,
        minTransaksi: 300000,
        tanggalMulai: '2026-01-01',
        tanggalSelesai: '2026-06-30',
        status: 'nonaktif',
        createdAt: '2026-01-01T00:00:00Z',
    },
];

interface PromoContextType {
    promos: Promo[];
    addPromo: (promo: Promo) => void;
    updatePromo: (id: number, data: Partial<Promo>) => void;
    togglePromoStatus: (id: number) => void;
    deletePromo: (id: number) => void;
    getPromoByKode: (kode: string) => Promo | undefined;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export function PromoProvider({ children }: { children: ReactNode }) {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('rental_promos');
        if (saved) {
            try {
                setPromos(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse promos from localStorage');
                setPromos(initialPromos);
            }
        } else {
            setPromos(initialPromos);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('rental_promos', JSON.stringify(promos));
        }
    }, [promos, isLoaded]);

    const addPromo = (promo: Promo) => {
        setPromos(prev => [promo, ...prev]);
    };

    const updatePromo = (id: number, data: Partial<Promo>) => {
        setPromos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const togglePromoStatus = (id: number) => {
        setPromos(prev => prev.map(p =>
            p.id === id ? { ...p, status: p.status === 'aktif' ? 'nonaktif' : 'aktif' } : p
        ));
    };

    const deletePromo = (id: number) => {
        setPromos(prev => prev.filter(p => p.id !== id));
    };

    const getPromoByKode = (kode: string): Promo | undefined => {
        return promos.find(p => p.kode.toLowerCase() === kode.toLowerCase() && p.status === 'aktif');
    };

    return (
        <PromoContext.Provider value={{
            promos,
            addPromo,
            updatePromo,
            togglePromoStatus,
            deletePromo,
            getPromoByKode
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
