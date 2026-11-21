import type { Article } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';
import type { NewsRepository } from './newsRepository';
import { ARTICLE_FIXTURES } from './newsFixtures';

function sortByPublishedAtDesc(articles: Article[]): Article[] {
  // A real API can legitimately return a published article with no
  // publishedAt yet; a comparator that returns 0 for any pair involving null
  // is non-transitive and leaves ordering implementation-defined (it breaks
  // Array.prototype.sort's contract). Make the order total: dated articles
  // first (newest first), undated articles last, ties broken by id so the
  // result is deterministic regardless of input order.
  return [...articles].sort((a, b) => {
    if (a.publishedAt === null && b.publishedAt === null) return a.id.localeCompare(b.id);
    if (a.publishedAt === null) return 1;
    if (b.publishedAt === null) return -1;
    const byDate = b.publishedAt.localeCompare(a.publishedAt);
    return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
  });
}

export class FixtureNewsRepository implements NewsRepository {
  private readonly published: Article[];

  constructor(fixtures: Article[] = ARTICLE_FIXTURES) {
    this.published = sortByPublishedAtDesc(fixtures.filter((a) => a.status === 'published'));
  }

  async listPublished({
    cursor,
    limit,
  }: {
    cursor?: string | null;
    limit: number;
  }): Promise<PaginatedResult<Article>> {
    const startIndex = cursor ? this.published.findIndex((a) => a.id === cursor) + 1 : 0;
    const page = this.published.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < this.published.length;
    const lastItem = page[page.length - 1];
    return {
      data: page,
      page: {
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        limit,
      },
    };
  }

  async getById(id: string): Promise<Article | null> {
    return this.published.find((a) => a.id === id) ?? null;
  }
}
