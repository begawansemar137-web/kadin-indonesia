import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ServiceListScreen } from '../ServiceListScreen';
import { FixtureServiceRepository } from '../../data/fixtureServiceRepository';
import type { ServiceRepository } from '../../data/serviceRepository';
import type { Service } from '../../domain/types';

const sampleService: Service = {
  id: 's1', code: 'SKA', title: 'Surat Keterangan Asal', description: 'Deskripsi layanan.',
  status: 'active', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

const inactiveService: Service = {
  id: 's5', code: 'COO', title: 'Certificate of Origin', description: 'Deskripsi layanan.',
  status: 'inactive', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

function makeRepository(overrides: Partial<ServiceRepository> = {}): ServiceRepository {
  return {
    list: jest.fn().mockResolvedValue({ data: [sampleService], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(sampleService),
    ...overrides,
  };
}

describe('ServiceListScreen', () => {
  it('shows a loading state before data arrives', async () => {
    render(<ServiceListScreen repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
  });

  it('renders services once loaded', async () => {
    render(<ServiceListScreen repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
  });

  it('shows the empty state when there are no services', async () => {
    const repository = makeRepository({
      list: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Belum ada data untuk ditampilkan.')).toBeTruthy());
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({ list: jest.fn().mockRejectedValue(new Error('network down')) });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
  });

  it('calls onSelectService with the service id when a card is tapped', async () => {
    const onSelectService = jest.fn();
    render(<ServiceListScreen repository={makeRepository()} onSelectService={onSelectService} />);
    await waitFor(() => screen.getByText('Surat Keterangan Asal'));
    fireEvent.press(screen.getByRole('button'));
    expect(onSelectService).toHaveBeenCalledWith('s1');
  });

  it('retries fetching when the error state retry button is pressed', async () => {
    const list = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ data: [sampleService], page: { nextCursor: null, limit: 10 } });
    const repository = makeRepository({ list });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat layanan. Silakan coba lagi.')).toBeTruthy());
    fireEvent.press(screen.getByText('Coba Lagi'));
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('renders an inactive service alongside active ones instead of filtering it out', async () => {
    const repository = makeRepository({
      list: jest.fn().mockResolvedValue({
        data: [sampleService, inactiveService],
        page: { nextCursor: null, limit: 10 },
      }),
    });
    render(<ServiceListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Surat Keterangan Asal')).toBeTruthy());
    expect(screen.getByText('Certificate of Origin')).toBeTruthy();
    expect(screen.getByText('Tidak tersedia')).toBeTruthy();
  });

  it('does not loop when no repository prop is given (uses a stable default instance)', async () => {
    const spy = jest.spyOn(FixtureServiceRepository.prototype, 'list');
    render(<ServiceListScreen />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
