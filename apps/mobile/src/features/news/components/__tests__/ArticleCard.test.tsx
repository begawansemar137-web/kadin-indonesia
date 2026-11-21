import { render, screen, fireEvent } from '@testing-library/react-native';
import { ArticleCard } from '../ArticleCard';
import type { Article } from '../../domain/types';

const baseArticle: Article = {
  id: 'a1', slug: 'contoh-artikel', title: 'Contoh Artikel',
  summary: 'Ringkasan contoh artikel.', body: 'Isi lengkap.',
  status: 'published', organizationId: 'org-1', authorId: 'user-1',
  publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
};

describe('ArticleCard', () => {
  it('renders the title as an accessible header', () => {
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByRole('header', { name: 'Contoh Artikel' })).toBeTruthy();
  });

  it('renders the summary text', () => {
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByText('Ringkasan contoh artikel.')).toBeTruthy();
  });

  it('shows an accessible fallback instead of a broken image when imageUrl is missing', () => {
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByLabelText('Tidak ada gambar untuk artikel Contoh Artikel')).toBeTruthy();
  });

  it('shows the image with an accessible label when imageUrl is present', () => {
    render(<ArticleCard article={{ ...baseArticle, imageUrl: 'https://example.com/a1.jpg' }} />);
    expect(screen.getByLabelText('Gambar untuk artikel Contoh Artikel')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ArticleCard article={baseArticle} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
