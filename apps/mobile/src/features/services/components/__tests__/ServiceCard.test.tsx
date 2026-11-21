import { render, screen, fireEvent } from '@testing-library/react-native';
import { ServiceCard } from '../ServiceCard';
import type { Service } from '../../domain/types';

const activeService: Service = {
  id: 's1', code: 'SKA', title: 'Surat Keterangan Asal', description: 'Deskripsi layanan.',
  status: 'active', organizationId: 'org-1', ownerId: 'user-1',
  eligibilitySummary: 'Anggota aktif KADIN.',
};

describe('ServiceCard', () => {
  it('renders the title as an accessible header', () => {
    render(<ServiceCard service={activeService} />);
    expect(screen.getByRole('header', { name: 'Surat Keterangan Asal' })).toBeTruthy();
  });

  it('does not show an unavailable badge or note for an active service', () => {
    render(<ServiceCard service={activeService} />);
    expect(screen.queryByText('Tidak tersedia')).toBeNull();
    expect(screen.queryByLabelText(/tidak tersedia/)).toBeNull();
  });

  it('shows an unavailable badge, status-only CTA, and an accessible note for an inactive service', () => {
    render(<ServiceCard service={{ ...activeService, status: 'inactive' }} />);
    expect(screen.getByText('Tidak tersedia')).toBeTruthy();
    expect(screen.getByText('Lihat status layanan')).toBeTruthy();
    expect(screen.queryByText('Lihat detail layanan')).toBeNull();
    expect(screen.getByLabelText(/Surat Keterangan Asal.*tidak tersedia/)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ServiceCard service={activeService} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
