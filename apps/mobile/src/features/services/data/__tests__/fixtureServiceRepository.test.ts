import { FixtureServiceRepository } from '../fixtureServiceRepository';
import { SERVICE_FIXTURES } from '../serviceFixtures';

describe('FixtureServiceRepository', () => {
  it('includes inactive services in list(), unlike News which hides unpublished articles', async () => {
    const repo = new FixtureServiceRepository();
    const result = await repo.list({ limit: 50 });
    const inactiveIds = SERVICE_FIXTURES.filter((s) => s.status === 'inactive').map((s) => s.id);
    const ids = result.data.map((s) => s.id);
    for (const id of inactiveIds) {
      expect(ids).toContain(id);
    }
  });

  it('paginates across all pages with no duplicates, no skips, and preserves fixture order', async () => {
    const repo = new FixtureServiceRepository();
    const expectedIds = SERVICE_FIXTURES.map((s) => s.id);
    const collectedIds: string[] = [];
    let cursor: string | null = null;
    do {
      const page = await repo.list({ cursor, limit: 2 });
      collectedIds.push(...page.data.map((s) => s.id));
      cursor = page.page.nextCursor;
    } while (cursor);
    expect(collectedIds).toEqual(expectedIds);
  });

  it('getById returns an inactive service rather than hiding it', async () => {
    const repo = new FixtureServiceRepository();
    const inactive = SERVICE_FIXTURES.find((s) => s.status === 'inactive');
    const result = await repo.getById(inactive!.id);
    expect(result?.id).toBe(inactive!.id);
    expect(result?.status).toBe('inactive');
  });

  it('getById returns null for a nonexistent id', async () => {
    const repo = new FixtureServiceRepository();
    const result = await repo.getById('does-not-exist');
    expect(result).toBeNull();
  });

  it('getById returns the service for an active id', async () => {
    const repo = new FixtureServiceRepository();
    const active = SERVICE_FIXTURES.find((s) => s.status === 'active');
    const result = await repo.getById(active!.id);
    expect(result?.id).toBe(active!.id);
  });
});
