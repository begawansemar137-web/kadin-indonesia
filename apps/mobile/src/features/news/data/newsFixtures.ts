import type { Article } from '../domain/types';

export const ARTICLE_FIXTURES: Article[] = [
  {
    id: 'a1', slug: 'kadin-luncurkan-program-umkm', title: 'KADIN Luncurkan Program UMKM Naik Kelas',
    summary: 'Program pendampingan bisnis untuk pelaku UMKM di seluruh Indonesia.',
    body: 'Isi lengkap artikel tentang program UMKM Naik Kelas, mencakup skema pendampingan, target peserta, dan jadwal pelaksanaan di berbagai daerah.',
    status: 'published', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
  },
  {
    id: 'a2', slug: 'forum-bisnis-asean', title: 'Forum Bisnis ASEAN 2026 Digelar di Jakarta',
    summary: 'Pertemuan pelaku usaha kawasan ASEAN membahas peluang investasi.',
    body: 'Isi lengkap artikel tentang Forum Bisnis ASEAN, termasuk daftar negara peserta dan agenda utama forum.',
    status: 'published', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2026-11-15T09:00:00.000Z', version: 1,
  },
  {
    id: 'a3', slug: 'pelatihan-ekspor', title: 'Pelatihan Ekspor untuk Anggota Baru',
    summary: 'Sesi pelatihan gratis bagi anggota baru yang ingin merambah pasar ekspor.',
    body: 'Isi lengkap artikel tentang pelatihan ekspor, syarat pendaftaran, dan narasumber yang terlibat.',
    status: 'published', organizationId: 'org-1', authorId: 'user-2',
    publishedAt: '2026-11-10T09:00:00.000Z', version: 2,
  },
  {
    id: 'a4', slug: 'kerjasama-asosiasi-regional', title: 'Kerja Sama dengan Asosiasi Regional Diperluas',
    summary: 'Penandatanganan nota kesepahaman dengan lima asosiasi daerah.',
    body: 'Isi lengkap artikel tentang kerja sama asosiasi regional dan dampaknya bagi anggota di daerah.',
    status: 'published', organizationId: 'org-2', authorId: 'user-2',
    publishedAt: '2026-11-05T09:00:00.000Z', version: 1,
  },
  {
    id: 'a5', slug: 'webinar-digitalisasi-umkm', title: 'Webinar Digitalisasi UMKM Diikuti Ribuan Peserta',
    summary: 'Webinar membahas adopsi teknologi digital bagi pelaku UMKM.',
    body: 'Isi lengkap artikel tentang webinar digitalisasi UMKM, termasuk rangkuman materi dan tautan rekaman.',
    status: 'published', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2026-11-01T09:00:00.000Z', version: 1,
  },
  {
    id: 'a6', slug: 'draft-rencana-strategis', title: '[DRAFT] Rencana Strategis 2027',
    summary: 'Draf internal, belum disetujui untuk publikasi.',
    body: 'Isi draf rencana strategis 2027 yang masih dalam tahap peninjauan internal.',
    status: 'draft', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: null, version: 1,
  },
  {
    id: 'a7', slug: 'arsip-laporan-2024', title: 'Laporan Tahunan 2024 (Arsip)',
    summary: 'Laporan tahunan yang sudah diarsipkan.',
    body: 'Isi laporan tahunan 2024 yang telah diarsipkan dan tidak lagi ditampilkan ke publik.',
    status: 'archived', organizationId: 'org-1', authorId: 'user-1',
    publishedAt: '2025-01-15T09:00:00.000Z', version: 3,
  },
];
