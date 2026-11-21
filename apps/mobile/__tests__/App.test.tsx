import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

import App from '../App';
import { AppShell } from '../src/shared/ui/AppShell';

describe('App', () => {
  it('wraps the navigation tree in AppShell', () => {
    const renderSpy = jest.spyOn(AppShell.prototype, 'render');
    render(<App />);
    expect(renderSpy).toHaveBeenCalled();
    renderSpy.mockRestore();
  });
});
