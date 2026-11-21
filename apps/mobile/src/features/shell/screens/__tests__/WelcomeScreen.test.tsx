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

  it('exposes an accessibility label for screen readers', () => {
    render(<WelcomeScreen />);
    expect(
      screen.getByLabelText('Halaman selamat datang KADIN Indonesia')
    ).toBeTruthy();
  });
});
