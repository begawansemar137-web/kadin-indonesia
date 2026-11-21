import type { Article } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';
import type { NewsRepository } from './newsRepository';
import { ARTICLE_FIXTURES } from './newsFixtures';

function sortByPublishedAtDesc(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    if (!a.publishedAt || !b.publishedAt) return 0;
    return b.publishedAt.localeCompare(a.publishedAt);
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
