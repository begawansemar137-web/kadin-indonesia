import type { Service } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';

export interface ServiceRepository {
  list(params: { cursor?: string | null; limit: number }): Promise<PaginatedResult<Service>>;
  getById(id: string): Promise<Service | null>;
}
