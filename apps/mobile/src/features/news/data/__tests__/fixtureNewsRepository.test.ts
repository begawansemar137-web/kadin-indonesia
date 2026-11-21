import { FixtureNewsRepository } from '../fixtureNewsRepository';
import { ARTICLE_FIXTURES } from '../newsFixtures';
import type { Article } from '../../domain/types';

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

  it('paginates across all pages with no duplicates, no skips, and correct desc-by-publishedAt order', async () => {
    const repo = new FixtureNewsRepository();
    const expectedIds = ARTICLE_FIXTURES.filter((a) => a.status === 'published')
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
      .map((a) => a.id);
    const collectedIds: string[] = [];
    let cursor: string | null = null;
    do {
      const page = await repo.listPublished({ cursor, limit: 2 });
      collectedIds.push(...page.data.map((a) => a.id));
      cursor = page.page.nextCursor;
    } while (cursor);
    expect(collectedIds).toEqual(expectedIds);
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

  it('sorts a published article with a null publishedAt after all dated articles, with a deterministic tiebreak', async () => {
    const fixtures: Article[] = [
      { ...ARTICLE_FIXTURES[0], id: 'null-b', publishedAt: null },
      { ...ARTICLE_FIXTURES[0], id: 'dated-old', publishedAt: '2026-01-01T00:00:00.000Z' },
      { ...ARTICLE_FIXTURES[0], id: 'null-a', publishedAt: null },
      { ...ARTICLE_FIXTURES[0], id: 'dated-new', publishedAt: '2026-06-01T00:00:00.000Z' },
    ];
    const repo = new FixtureNewsRepository(fixtures);
    const result = await repo.listPublished({ limit: 10 });
    expect(result.data.map((a) => a.id)).toEqual(['dated-new', 'dated-old', 'null-a', 'null-b']);
  });
});
