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

  it('puts an accessible label on the whole card noting no image is present when imageUrl is missing', () => {
    // The label lives on the Pressable itself (not on the inner image/fallback
    // View) because a Pressable groups its children into one accessibility
    // element by default — a label on a child inside it is unlikely to be
    // announced at all.
    render(<ArticleCard article={baseArticle} />);
    expect(screen.getByLabelText(/Contoh Artikel.*tanpa gambar/)).toBeTruthy();
  });

  it('does not mention "tanpa gambar" in the accessible label when an image is present', () => {
    render(<ArticleCard article={{ ...baseArticle, imageUrl: 'https://example.com/a1.jpg' }} />);
    expect(screen.queryByLabelText(/tanpa gambar/)).toBeNull();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('falls back to the placeholder and updates the accessible label when the image fails to load', () => {
    render(<ArticleCard article={{ ...baseArticle, imageUrl: 'https://example.com/broken.jpg' }} />);
    expect(screen.queryByLabelText(/tanpa gambar/)).toBeNull();
    fireEvent(screen.getByTestId('article-card-image'), 'error');
    expect(screen.getByLabelText(/tanpa gambar/)).toBeTruthy();
    expect(screen.queryByTestId('article-card-image')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ArticleCard article={baseArticle} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
