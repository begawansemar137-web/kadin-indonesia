import { useEffect, useState, type ReactElement } from 'react';
import { FlatList } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { ArticleCard } from '../components/ArticleCard';
import { FixtureNewsRepository } from '../data/fixtureNewsRepository';
import type { Article } from '../domain/types';
import type { NewsRepository } from '../data/newsRepository';

const PAGE_SIZE = 10;

// Module-scope singleton: a default parameter expression re-evaluates on every
// render, so `repository = new FixtureNewsRepository()` inline would create a
// new object identity each render, retrigger the effect below (which depends
// on `repository`), and loop indefinitely on the no-prop path every route uses.
const defaultNewsRepository = new FixtureNewsRepository();

export interface NewsListScreenProps {
  repository?: NewsRepository;
  onSelectArticle?: (articleId: string) => void;
}

export function NewsListScreen({
  repository = defaultNewsRepository,
  onSelectArticle,
}: NewsListScreenProps): ReactElement {
  const [articles, setArticles] = useState<Article[]>([]);
  const [state, setState] = useState<ScreenState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .listPublished({ limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setArticles(result.data);
        setState(result.data.length === 0 ? 'empty' : 'ready');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [repository, reloadToken]);

  return (
    <ScreenLayout
      state={state}
      errorMessage="Gagal memuat berita. Silakan coba lagi."
      onRetry={() => setReloadToken((t) => t + 1)}
    >
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} onPress={() => onSelectArticle?.(item.id)} />}
      />
    </ScreenLayout>
  );
}
