import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ScreenLayout } from '../ScreenLayout';

describe('ScreenLayout', () => {
  it('shows a loading indicator in the loading state, announced as a progress bar', () => {
    render(
      <ScreenLayout state="loading">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('shows the default error message in the error state', () => {
    render(
      <ScreenLayout state="error">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('Terjadi kesalahan. Silakan coba lagi.')).toBeTruthy();
  });

  it('shows a custom error message when provided', () => {
    render(
      <ScreenLayout state="error" errorMessage="Artikel tidak ditemukan.">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('Artikel tidak ditemukan.')).toBeTruthy();
  });

  it('shows the empty message in the empty state', () => {
    render(
      <ScreenLayout state="empty">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('Belum ada data untuk ditampilkan.')).toBeTruthy();
  });

  it('renders children only in the ready state', () => {
    render(
      <ScreenLayout state="ready">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('does not render children in the loading state', () => {
    render(
      <ScreenLayout state="loading">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.queryByText('content')).toBeNull();
  });

  it('does not show a retry button in the error state when onRetry is not provided', () => {
    render(
      <ScreenLayout state="error">
        <Text>content</Text>
      </ScreenLayout>
    );
    expect(screen.queryByText('Coba Lagi')).toBeNull();
  });

  it('shows a retry button in the error state and calls onRetry when tapped', () => {
    const onRetry = jest.fn();
    render(
      <ScreenLayout state="error" onRetry={onRetry}>
        <Text>content</Text>
      </ScreenLayout>
    );
    fireEvent.press(screen.getByText('Coba Lagi'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
