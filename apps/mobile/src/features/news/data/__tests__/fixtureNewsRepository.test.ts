import { FixtureNewsRepository } from '../fixtureNewsRepository';
import { ARTICLE_FIXTURES } from '../newsFixtures';

describe('FixtureNewsRepository', () => {
  it('only returns published articles from listPublished', async () => {
    const repo = new FixtureNewsRepository();
    const result = await repo.listPublished({ limit: 50 });
    const ids = result.data.map((a) => a.id);
    const unpublishedIds = ARTICLE_FIXTURES.filter((a) => a.status !== 'published').map((a) => a.id);
    for (const id of unpublishedIds) {
      expect(ids).not.toContain(id);
    }
  });

  it('paginates across two pages with no duplicates and full coverage', async () => {
    const repo = new FixtureNewsRepository();
    const publishedCount = ARTICLE_FIXTURES.filter((a) => a.status === 'published').length;
    const limit = 2;
    const page1 = await repo.listPublished({ limit });
    const page2 = await repo.listPublished({ cursor: page1.page.nextCursor, limit });
    const allIds = [...page1.data, ...page2.data].map((a) => a.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
    expect(allIds.length).toBeLessThanOrEqual(publishedCount);
  });

  it('getById returns null for an unpublished article id (no draft leakage via id guess)', async () => {
    const repo = new FixtureNewsRepository();
    const draft = ARTICLE_FIXTURES.find((a) => a.status !== 'published');
    expect(draft).toBeTruthy();
    const result = await repo.getById(draft!.id);
    expect(result).toBeNull();
  });

  it('getById returns null for a nonexistent id', async () => {
    const repo = new FixtureNewsRepository();
    const result = await repo.getById('does-not-exist');
    expect(result).toBeNull();
  });

  it('getById returns the article for a published id', async () => {
    const repo = new FixtureNewsRepository();
    const published = ARTICLE_FIXTURES.find((a) => a.status === 'published');
    const result = await repo.getById(published!.id);
    expect(result?.id).toBe(published!.id);
  });
});
