import type { Service } from '../domain/types';
import type { PaginatedResult } from '../../../shared/api/types';
import type { ServiceRepository } from './serviceRepository';
import { SERVICE_FIXTURES } from './serviceFixtures';

export class FixtureServiceRepository implements ServiceRepository {
  private readonly services: Service[];

  constructor(fixtures: Service[] = SERVICE_FIXTURES) {
    this.services = [...fixtures];
  }

  async list({
    cursor,
    limit,
  }: {
    cursor?: string | null;
    limit: number;
  }): Promise<PaginatedResult<Service>> {
    const startIndex = cursor ? this.services.findIndex((s) => s.id === cursor) + 1 : 0;
    const page = this.services.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < this.services.length;
    const lastItem = page[page.length - 1];
    return {
      data: page,
      page: {
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        limit,
      },
    };
  }

  async getById(id: string): Promise<Service | null> {
    return this.services.find((s) => s.id === id) ?? null;
  }
}
