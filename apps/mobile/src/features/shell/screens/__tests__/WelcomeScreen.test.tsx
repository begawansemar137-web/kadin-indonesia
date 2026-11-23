import { render, screen } from '@testing-library/react-native';
import { WelcomeScreen } from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the KADIN welcome heading', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('Selamat datang di KADIN Indonesia')).toBeTruthy();
  });

  it('discloses that this is a pre-alpha stub, not a finished product', () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByText(/tahap pengembangan awal.*belum aktif/i)
    ).toBeTruthy();
  });

  it('exposes the heading as an accessible header for screen readers', () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByRole('header', { name: 'Selamat datang di KADIN Indonesia' })
    ).toBeTruthy();
  });

  it('renders the KADIN Indonesia logo as an accessible image', () => {
    render(<WelcomeScreen />);
    expect(screen.getByRole('image', { name: 'Logo KADIN Indonesia' })).toBeTruthy();
  });

  it('renders the Kadin Verse sub-brand lockup below the crest as an accessible image', () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByRole('image', { name: 'Kadin Verse, Portal Digital Dunia Usaha Indonesia' })
    ).toBeTruthy();
  });
});
