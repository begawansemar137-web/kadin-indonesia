import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { NewsListScreen } from '../NewsListScreen';
import { FixtureNewsRepository } from '../../data/fixtureNewsRepository';
import type { NewsRepository } from '../../data/newsRepository';
import type { Article } from '../../domain/types';

const sampleArticle: Article = {
  id: 'a1', slug: 'contoh', title: 'Contoh Artikel', summary: 'Ringkasan.',
  body: 'Isi.', status: 'published', organizationId: 'org-1', authorId: 'user-1',
  publishedAt: '2026-11-18T09:00:00.000Z', version: 1,
};

function makeRepository(overrides: Partial<NewsRepository> = {}): NewsRepository {
  return {
    listPublished: jest.fn().mockResolvedValue({ data: [sampleArticle], page: { nextCursor: null, limit: 10 } }),
    getById: jest.fn().mockResolvedValue(sampleArticle),
    ...overrides,
  };
}

describe('NewsListScreen', () => {
  it('shows a loading state before data arrives', async () => {
    render(<NewsListScreen repository={makeRepository()} />);
    expect(screen.getByLabelText('Memuat data')).toBeTruthy();
    // Flush the pending repository promise within this test's act() boundary
    // so React doesn't warn about an unwrapped state update after teardown.
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
  });

  it('renders articles once loaded', async () => {
    render(<NewsListScreen repository={makeRepository()} />);
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
  });

  it('shows the empty state when there are no published articles', async () => {
    const repository = makeRepository({
      listPublished: jest.fn().mockResolvedValue({ data: [], page: { nextCursor: null, limit: 10 } }),
    });
    render(<NewsListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Belum ada data untuk ditampilkan.')).toBeTruthy());
  });

  it('shows an error state when the repository rejects', async () => {
    const repository = makeRepository({
      listPublished: jest.fn().mockRejectedValue(new Error('network down')),
    });
    render(<NewsListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat berita. Silakan coba lagi.')).toBeTruthy());
  });

  it('calls onSelectArticle with the article id when a card is tapped', async () => {
    const onSelectArticle = jest.fn();
    render(<NewsListScreen repository={makeRepository()} onSelectArticle={onSelectArticle} />);
    await waitFor(() => screen.getByText('Contoh Artikel'));
    fireEvent.press(screen.getByRole('button'));
    expect(onSelectArticle).toHaveBeenCalledWith('a1');
  });

  it('retries fetching when the error state retry button is pressed', async () => {
    const listPublished = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ data: [sampleArticle], page: { nextCursor: null, limit: 10 } });
    const repository = makeRepository({ listPublished });
    render(<NewsListScreen repository={repository} />);
    await waitFor(() => expect(screen.getByText('Gagal memuat berita. Silakan coba lagi.')).toBeTruthy());
    fireEvent.press(screen.getByText('Coba Lagi'));
    await waitFor(() => expect(screen.getByText('Contoh Artikel')).toBeTruthy());
    expect(listPublished).toHaveBeenCalledTimes(2);
  });

  it('does not loop when no repository prop is given (uses a stable default instance)', async () => {
    const spy = jest.spyOn(FixtureNewsRepository.prototype, 'listPublished');
    render(<NewsListScreen />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    // Give any runaway effect loop a window to fire again before asserting it didn't.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
