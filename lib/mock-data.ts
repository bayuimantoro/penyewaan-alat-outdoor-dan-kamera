// Mock data for development and demonstration

import { User, Kategori, Barang, Transaksi, DetailTransaksi, Inspeksi } from '@/types';

// Mock Users
export const mockUsers: User[] = [
    {
        id: 1,
        nama: 'Admin Utama',
        email: 'admin@rentalgear.com',
        noHp: '081234567890',
        alamat: 'Jl. Admin No. 1, Jakarta',
        role: 'admin',
        statusVerifikasi: 'approved',
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        nama: 'Budi Gudang',
        email: 'gudang@rentalgear.com',
        noHp: '081234567891',
        alamat: 'Jl. Gudang No. 2, Jakarta',
        role: 'gudang',
        statusVerifikasi: 'approved',
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 3,
        nama: 'Ahmad Traveler',
        email: 'ahmad@gmail.com',
        noHp: '081234567892',
        alamat: 'Jl. Merdeka No. 123, Bandung',
        role: 'member',
        fotoKtp: '/uploads/ktp/ahmad.jpg',
        statusVerifikasi: 'approved',
        createdAt: '2024-06-15T10:30:00Z',
    },
];

// Mock Categories
export const mockKategori: Kategori[] = [
    {
        id: 1,
        nama: 'Kamera',
        deskripsi: 'Kamera DSLR, Mirrorless, dan Action Camera untuk kebutuhan foto dan video',
        icon: 'camera',
    },
    {
        id: 2,
        nama: 'Tenda',
        deskripsi: 'Tenda camping berbagai ukuran untuk petualangan outdoor',
        icon: 'tent',
    },
    {
        id: 3,
        nama: 'Sleeping Bag',
        deskripsi: 'Sleeping bag hangat untuk camping di segala cuaca',
        icon: 'bed',
    },
    {
        id: 4,
        nama: 'Carrier',
        deskripsi: 'Tas carrier berbagai ukuran untuk hiking dan trekking',
        icon: 'backpack',
    },
    {
        id: 5,
        nama: 'Aksesoris Kamera',
        deskripsi: 'Lensa, tripod, stabilizer, dan aksesoris kamera lainnya',
        icon: 'aperture',
    },
    {
        id: 6,
        nama: 'Peralatan Masak',
        deskripsi: 'Kompor portable, cooking set, dan peralatan masak outdoor',
        icon: 'flame',
    },
];

// Mock Barang
export const mockBarang: Barang[] = [
    // Kamera
    {
        id: 1,
        kode: 'CAM-001',
        nama: 'Sony A7 III',
        kategoriId: 1,
        merk: 'Sony',
        deskripsi: 'Kamera mirrorless full-frame dengan autofocus cepat dan video 4K',
        hargaSewaPerHari: 350000,
        dendaPerHari: 50000,
        stok: 3,
        foto: ['/images/barang/sony-a7iii.jpg'],
        status: 'tersedia',
    },
    {
        id: 2,
        kode: 'CAM-002',
        nama: 'Canon EOS R6',
        kategoriId: 1,
        merk: 'Canon',
        deskripsi: 'Kamera mirrorless profesional dengan IBIS dan dual card slot',
        hargaSewaPerHari: 400000,
        dendaPerHari: 60000,
        stok: 2,
        foto: ['/images/barang/canon-r6.jpg'],
        status: 'tersedia',
    },
    {
        id: 3,
        kode: 'CAM-003',
        nama: 'GoPro Hero 12',
        kategoriId: 1,
        merk: 'GoPro',
        deskripsi: 'Action camera waterproof dengan video 5.3K dan HyperSmooth',
        hargaSewaPerHari: 150000,
        dendaPerHari: 25000,
        stok: 5,
        foto: ['/images/barang/gopro-12.jpg'],
        status: 'tersedia',
    },
    // Tenda
    {
        id: 4,
        kode: 'TND-001',
        nama: 'Tenda Dome 4 Orang',
        kategoriId: 2,
        merk: 'Eiger',
        deskripsi: 'Tenda dome kapasitas 4 orang, waterproof, dan mudah dipasang',
        hargaSewaPerHari: 75000,
        dendaPerHari: 15000,
        stok: 8,
        foto: ['/images/barang/tenda-dome4.jpg'],
        status: 'tersedia',
    },
    {
        id: 5,
        kode: 'TND-002',
        nama: 'Tenda Ultralight 2P',
        kategoriId: 2,
        merk: 'Naturehike',
        deskripsi: 'Tenda ultralight untuk 2 orang, cocok untuk hiking',
        hargaSewaPerHari: 100000,
        dendaPerHari: 20000,
        stok: 4,
        foto: ['/images/barang/tenda-ultralight.jpg'],
        status: 'tersedia',
    },
    {
        id: 6,
        kode: 'TND-003',
        nama: 'Tenda Family 6 Orang',
        kategoriId: 2,
        merk: 'Coleman',
        deskripsi: 'Tenda besar untuk keluarga, 2 ruangan dengan vestibule',
        hargaSewaPerHari: 150000,
        dendaPerHari: 30000,
        stok: 3,
        foto: ['/images/barang/tenda-family.jpg'],
        status: 'disewa',
    },
    // Sleeping Bag
    {
        id: 7,
        kode: 'SB-001',
        nama: 'Sleeping Bag -5°C',
        kategoriId: 3,
        merk: 'Consina',
        deskripsi: 'Sleeping bag comfort rating -5°C, cocok untuk gunung tinggi',
        hargaSewaPerHari: 35000,
        dendaPerHari: 10000,
        stok: 15,
        foto: ['/images/barang/sb-minus5.jpg'],
        status: 'tersedia',
    },
    {
        id: 8,
        kode: 'SB-002',
        nama: 'Sleeping Bag 10°C',
        kategoriId: 3,
        merk: 'Rei',
        deskripsi: 'Sleeping bag ringan untuk camping santai',
        hargaSewaPerHari: 25000,
        dendaPerHari: 8000,
        stok: 20,
        foto: ['/images/barang/sb-10c.jpg'],
        status: 'tersedia',
    },
    // Carrier
    {
        id: 9,
        kode: 'CRR-001',
        nama: 'Carrier 60L Deuter',
        kategoriId: 4,
        merk: 'Deuter',
        deskripsi: 'Carrier premium 60 liter dengan frame aluminium',
        hargaSewaPerHari: 50000,
        dendaPerHari: 15000,
        stok: 6,
        foto: ['/images/barang/carrier-60l.jpg'],
        status: 'tersedia',
    },
    {
        id: 10,
        kode: 'CRR-002',
        nama: 'Carrier 40L Osprey',
        kategoriId: 4,
        merk: 'Osprey',
        deskripsi: 'Carrier day-hike 40 liter, ringan dan nyaman',
        hargaSewaPerHari: 40000,
        dendaPerHari: 12000,
        stok: 8,
        foto: ['/images/barang/carrier-40l.jpg'],
        status: 'maintenance',
    },
    // Aksesoris Kamera
    {
        id: 11,
        kode: 'ACC-001',
        nama: 'Lensa Sony 24-70mm f/2.8',
        kategoriId: 5,
        merk: 'Sony',
        deskripsi: 'Lensa zoom profesional untuk Sony E-mount',
        hargaSewaPerHari: 200000,
        dendaPerHari: 35000,
        stok: 2,
        foto: ['/images/barang/lensa-2470.jpg'],
        status: 'tersedia',
    },
    {
        id: 12,
        kode: 'ACC-002',
        nama: 'DJI RS 3 Gimbal',
        kategoriId: 5,
        merk: 'DJI',
        deskripsi: 'Gimbal stabilizer 3-axis untuk kamera mirrorless',
        hargaSewaPerHari: 175000,
        dendaPerHari: 30000,
        stok: 3,
        foto: ['/images/barang/dji-rs3.jpg'],
        status: 'tersedia',
    },
    // Peralatan Masak
    {
        id: 13,
        kode: 'MSK-001',
        nama: 'Kompor Portable + Gas',
        kategoriId: 6,
        merk: 'Kovea',
        deskripsi: 'Kompor camping portable dengan 2 tabung gas',
        hargaSewaPerHari: 25000,
        dendaPerHari: 8000,
        stok: 10,
        foto: ['/images/barang/kompor.jpg'],
        status: 'tersedia',
    },
    {
        id: 14,
        kode: 'MSK-002',
        nama: 'Cooking Set Aluminium',
        kategoriId: 6,
        merk: 'Dhaulagiri',
        deskripsi: 'Set peralatan masak camping lengkap untuk 4 orang',
        hargaSewaPerHari: 30000,
        dendaPerHari: 10000,
        stok: 8,
        foto: ['/images/barang/cooking-set.jpg'],
        status: 'tersedia',
    },
];

// Mock Transaksi
export const mockTransaksi: Transaksi[] = [
    {
        id: 1,
        kode: 'TRX20241215001',
        userId: 3,
        tanggalBooking: '2024-12-15T08:00:00Z',
        tanggalMulai: '2024-12-20',
        tanggalSelesai: '2024-12-22',
        totalHari: 3,
        subtotal: 1275000,
        diskon: 0,
        denda: 0,
        total: 1275000,
        status: 'sedang_disewa',
        createdAt: '2024-12-15T08:00:00Z',
    },
    {
        id: 2,
        kode: 'TRX20241210002',
        userId: 3,
        tanggalBooking: '2024-12-10T10:30:00Z',
        tanggalMulai: '2024-12-11',
        tanggalSelesai: '2024-12-13',
        totalHari: 3,
        subtotal: 450000,
        diskon: 0,
        denda: 35000,
        total: 485000,
        status: 'selesai',
        createdAt: '2024-12-10T10:30:00Z',
    },
];

// Mock Detail Transaksi
export const mockDetailTransaksi: DetailTransaksi[] = [
    // Transaksi 1
    { id: 1, transaksiId: 1, barangId: 1, hargaSewa: 350000, qty: 1, subtotal: 1050000 },
    { id: 2, transaksiId: 1, barangId: 4, hargaSewa: 75000, qty: 1, subtotal: 225000 },
    // Transaksi 2
    { id: 3, transaksiId: 2, barangId: 3, hargaSewa: 150000, qty: 1, subtotal: 450000 },
];

// Mock Inspeksi
export const mockInspeksi: Inspeksi[] = [
    {
        id: 1,
        transaksiId: 2,
        barangId: 3,
        kondisiAwal: 'baik',
        kondisiAkhir: 'kotor',
        keterangan: 'Ada noda tanah pada body kamera',
        biayaDenda: 35000,
        petugasId: 2,
        createdAt: '2024-12-13T16:00:00Z',
    },
];

// Helper to get related data
export function getBarangWithKategori(barang: Barang): Barang & { kategori: Kategori } {
    const kategori = mockKategori.find(k => k.id === barang.kategoriId)!;
    return { ...barang, kategori };
}

export function getTransaksiWithUser(transaksi: Transaksi): Transaksi & { user: User } {
    const user = mockUsers.find(u => u.id === transaksi.userId)!;
    return { ...transaksi, user };
}
