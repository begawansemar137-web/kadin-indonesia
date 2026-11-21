import type { Service } from '../domain/types';

export const SERVICE_FIXTURES: Service[] = [
  {
    id: 's1', code: 'SKA', title: 'Surat Keterangan Asal (SKA)',
    description: 'Layanan penerbitan Surat Keterangan Asal untuk keperluan ekspor barang ke luar negeri.',
    status: 'active', organizationId: 'org-1', ownerId: 'user-1',
    eligibilitySummary: 'Anggota aktif KADIN dengan Nomor Induk Berusaha (NIB) yang valid.',
  },
  {
    id: 's2', code: 'LEGALISASI', title: 'Legalisasi Dokumen Perdagangan',
    description: 'Legalisasi dokumen perdagangan internasional untuk keperluan ekspor dan impor.',
    status: 'active', organizationId: 'org-1', ownerId: 'user-2',
    eligibilitySummary: 'Anggota aktif KADIN dengan dokumen asli yang akan dilegalisasi.',
  },
  {
    id: 's3', code: 'KONSULTASI-EKSPOR', title: 'Konsultasi Bisnis Ekspor',
    description: 'Sesi konsultasi dengan pakar perdagangan ekspor untuk membantu merencanakan ekspansi pasar.',
    status: 'active', organizationId: 'org-2', ownerId: 'user-2',
    eligibilitySummary: 'Terbuka untuk seluruh anggota KADIN yang terdaftar.',
  },
  {
    id: 's4', code: 'PENDAMPINGAN-LEGALITAS', title: 'Pendampingan Legalitas Usaha',
    description: 'Pendampingan pengurusan izin dan legalitas usaha bagi anggota baru.',
    status: 'active', organizationId: 'org-1', ownerId: 'user-1',
    eligibilitySummary: 'Anggota baru yang bergabung dalam 12 bulan terakhir.',
  },
  {
    id: 's5', code: 'COO', title: 'Certificate of Origin (COO)',
    description: 'Penerbitan Certificate of Origin untuk barang ekspor ke negara mitra dagang.',
    status: 'inactive', organizationId: 'org-1', ownerId: 'user-1',
    eligibilitySummary: 'Sementara tidak tersedia, menunggu persetujuan regulasi terkait.',
  },
];
