// Types for the Rental System

export type UserRole = 'member' | 'admin' | 'gudang';

export type StatusVerifikasi = 'pending' | 'approved' | 'rejected';

export type StatusTransaksi =
  | 'menunggu_pembayaran'
  | 'menunggu_konfirmasi'
  | 'sedang_disewa'
  | 'menunggu_pengembalian'
  | 'selesai'
  | 'dibatalkan';

export type StatusBarang = 'tersedia' | 'disewa' | 'maintenance' | 'rusak';

export type KondisiBarang = 'baik' | 'kotor' | 'rusak_ringan' | 'rusak_berat' | 'hilang';

export interface User {
  id: number;
  nama: string;
  email: string;
  noHp: string;
  alamat: string;
  role: UserRole;
  fotoKtp?: string;
  statusVerifikasi: StatusVerifikasi;
  createdAt: string;
}

export interface Kategori {
  id: number;
  nama: string;
  deskripsi: string;
  icon: string;
}

export interface Barang {
  id: number;
  kode: string;
  nama: string;
  kategoriId: number;
  kategori?: Kategori;
  merk: string;
  deskripsi: string;
  hargaSewaPerHari: number;
  dendaPerHari: number;
  stok: number;
  foto: string[];
  status: StatusBarang;
}

export interface Transaksi {
  id: number;
  kode: string;
  userId: number;
  user?: User;
  tanggalBooking: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalHari: number;
  subtotal: number;
  diskon: number;
  denda: number;
  total: number;
  status: StatusTransaksi;
  createdAt: string;
}

export interface DetailTransaksi {
  id: number;
  transaksiId: number;
  barangId: number;
  barang?: Barang;
  hargaSewa: number;
  qty: number;
  subtotal: number;
}

export interface Pembayaran {
  id: number;
  transaksiId: number;
  jenis: 'dp' | 'pelunasan' | 'denda';
  jumlah: number;
  buktiBayar?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface Inspeksi {
  id: number;
  transaksiId: number;
  barangId: number;
  barang?: Barang;
  kondisiAwal: KondisiBarang;
  kondisiAkhir?: KondisiBarang;
  keterangan?: string;
  biayaDenda: number;
  petugasId: number;
  createdAt: string;
}

export interface Promo {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string;
  tipeDiskon: 'persentase' | 'nominal';
  nilaiDiskon: number;
  minTransaksi: number;
  maxDiskon?: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nama: string;
  email: string;
  password: string;
  noHp: string;
  alamat: string;
  fotoKtp: File | null;
}

// Cart/Booking types
export interface CartItem {
  barang: Barang;
  qty: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalHari: number;
  subtotal: number;
}
