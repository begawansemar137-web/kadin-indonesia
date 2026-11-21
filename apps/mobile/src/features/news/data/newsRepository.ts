import type { Article } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';

export interface NewsRepository {
  listPublished(params: { cursor?: string | null; limit: number }): Promise<PaginatedResult<Article>>;
  getById(id: string): Promise<Article | null>;
}
