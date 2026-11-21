import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ServiceDetailScreen } from '../ServiceDetailScreen';
import { FixtureServiceRepository } from '../../data/fixtureServiceRepository';
import type { ServiceRepository } from '../../data/serviceRepository';
import type { Service } from '../../domain/types';

const activeService: Service = {
  id: 's1', code: 'SKA', title: 'Surat Keterangan Asal', description: 'Deskripsi lengkap layanan SKA.',
  status: 'active', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

const inactiveService: Service = { ...activeService, id: 's5', title: 'Certificate of Origin', status: 'inactive' };

function makeRepository(overrides: Partial<ServiceRepository> = {}): ServiceRepository {
  return {
    list: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(activeService),
    ...overrides,
  };
}

describe('ServiceDetailScreen', () => {
  it('shows a loading state before data arrives', async () => {
    render(<ServiceDetailScreen serviceId="s1" repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
  });

  it('renders the service title, description, and eligibility once loaded', async () => {
    render(<ServiceDetailScreen serviceId="s1" repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(screen.getByText('Deskripsi lengkap layanan SKA.')).toBeTruthy();
    expect(screen.getByText('Syarat: Anggota aktif KADIN.')).toBeTruthy();
  });

  it('does not show an unavailable badge for an active service', async () => {
    render(<ServiceDetailScreen serviceId="s1" repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(screen.queryByText('Tidak tersedia')).toBeNull();
  });

  it('shows an unavailable badge for an inactive service rather than hiding it', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(inactiveService) });
    render(<ServiceDetailScreen serviceId="s5" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Certificate of Origin')).toBeTruthy());
    expect(screen.getByText('Tidak tersedia')).toBeTruthy();
  });

  it('shows a not-found state for a nonexistent service id (distinct from the inactive case above)', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(null) });
    render(<ServiceDetailScreen serviceId="does-not-exist" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Layanan tidak ditemukan.')).toBeTruthy());
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({ getById: jest.fn().mockRejectedValue(new Error('network down')) });
    render(<ServiceDetailScreen serviceId="s1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
  });

  it('retries fetching when the error state retry button is pressed', async () => {
    const getById = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(activeService);
    const repository = makeRepository({ getById });
    render(<ServiceDetailScreen serviceId="s1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
    fireEvent.press(screen.getByText('Coba Lagi'));
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it('does not loop when no repository prop is given (uses a stable default instance)', async () => {
    const spy = jest.spyOn(FixtureServiceRepository.prototype, 'getById');
    render(<ServiceDetailScreen serviceId="s1" />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
