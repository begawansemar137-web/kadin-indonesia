import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { NewsDetailScreen } from '../NewsDetailScreen';
import { FixtureNewsRepository } from '../../data/fixtureNewsRepository';
import type { NewsRepository } from '../../data/newsRepository';
import type { Article } from '../../domain/types';

const sampleArticle: Article = {
  id: 'a1', slug: 'contoh', title: 'Contoh Artikel', summary: 'Ringkasan.',
  body: 'Isi lengkap artikel di sini.', status: 'published', organizationId: 'org-1',
  authorId: 'user-1', publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
};

function makeRepository(overrides: Partial<NewsRepository> = {}): NewsRepository {
  return {
    listPublished: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(sampleArticle),
    ...overrides,
  };
}

describe('NewsDetailScreen', () => {
  it('shows a loading state before data arrives', async () => {
    render(<NewsDetailScreen articleId="a1" repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
  });

  it('renders the article title and body once loaded', async () => {
    render(<NewsDetailScreen articleId="a1" repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
    expect(screen.getByText('Isi lengkap artikel di sini.')).toBeTruthy();
  });

  it('shows a not-found state for a nonexistent article id', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(null) });
    render(<NewsDetailScreen articleId="does-not-exist" repository={repository} />);
    await waitFor(() =>
      expect(screen.getByText('Artikel tidak ditemukan atau belum dipublikasikan.')).toBeTruthy()
    );
  });

  it('shows the same not-found state for an unpublished article id as for a nonexistent one', async () => {
    const repository = makeRepository({ getById: jest.fn().mockResolvedValue(null) });
    render(<NewsDetailScreen articleId="draft-id" repository={repository} />);
    await waitFor(() =>
      expect(screen.getByText('Artikel tidak ditemukan atau belum dipublikasikan.')).toBeTruthy()
    );
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({ getById: jest.fn().mockRejectedValue(new Error('network down')) });
    render(<NewsDetailScreen articleId="a1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat artikel. Silakan coba lagi.')).toBeTruthy());
  });

  it('retries fetching when the error state retry button is pressed', async () => {
    const getById = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(sampleArticle);
    const repository = makeRepository({ getById });
    render(<NewsDetailScreen articleId="a1" repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat artikel. Silakan coba lagi.')).toBeTruthy());
    fireEvent.press(screen.getByText('Coba Lagi'));
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it('does not loop when no repository prop is given (uses a stable default instance)', async () => {
    const spy = jest.spyOn(FixtureNewsRepository.prototype, 'getById');
    render(<NewsDetailScreen articleId="a1" />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
