import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppShell } from '../AppShell';

function ThrowingChild(): ReactElement {
  throw new Error('boom');
}

describe('AppShell', () => {
  it('renders its children when there is no error', () => {
    render(
      <AppShell>
        <Text>child content</Text>
      </AppShell>
    );
    expect(screen.getByText('child content')).toBeTruthy();
  });

  it('shows a fallback message instead of crashing when a child throws', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AppShell>
        <ThrowingChild />
      </AppShell>
    );
    expect(
      screen.getByText('Terjadi kesalahan. Silakan muat ulang aplikasi.')
    ).toBeTruthy();
    consoleError.mockRestore();
  });
});
