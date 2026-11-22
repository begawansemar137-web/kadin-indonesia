import { render, screen, fireEvent } from '@testing-library/react-native';
import { HomeRoute } from '../HomeRoute';

function makeNavigation() {
  return { navigate: jest.fn() } as any;
}

describe('HomeRoute', () => {
  it('renders the welcome hero', () => {
    render(<HomeRoute navigation={makeNavigation()} route={{} as any} />);
    expect(screen.getByText('Selamat datang di KADIN Indonesia')).toBeTruthy();
  });

  it('navigates to NewsList when the Berita card is pressed', () => {
    const navigation = makeNavigation();
    render(<HomeRoute navigation={navigation} route={{} as any} />);
    fireEvent.press(screen.getByRole('button', { name: /^Berita/ }));
    expect(navigation.navigate).toHaveBeenCalledWith('NewsList');
  });

  it('navigates to ServiceList when the Layanan card is pressed', () => {
    const navigation = makeNavigation();
    render(<HomeRoute navigation={navigation} route={{} as any} />);
    fireEvent.press(screen.getByRole('button', { name: /^Layanan/ }));
    expect(navigation.navigate).toHaveBeenCalledWith('ServiceList');
  });
});
