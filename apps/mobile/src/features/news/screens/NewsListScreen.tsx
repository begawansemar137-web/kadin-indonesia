import { useEffect, useState, type ReactElement } from 'react';
import { FlatList } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { ArticleCard } from '../components/ArticleCard';
import { FixtureNewsRepository } from '../data/fixtureNewsRepository';
import type { Article } from '../domain/types';
import type { NewsRepository } from '../data/newsRepository';

const PAGE_SIZE = 10;

export interface NewsListScreenProps {
  repository?: NewsRepository;
  onSelectArticle?: (articleId: string) => void;
}

export function NewsListScreen({
  repository = new FixtureNewsRepository(),
  onSelectArticle,
}: NewsListScreenProps): ReactElement {
  const [articles, setArticles] = useState<Article[]>([]);
  const [state, setState] = useState<ScreenState>('loading');

  useEffect(() => {
    let cancelled = false;
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
  }, [repository]);

  return (
    <ScreenLayout state={state} errorMessage="Gagal memuat berita. Silakan coba lagi.">
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} onPress={() => onSelectArticle?.(item.id)} />}
      />
    </ScreenLayout>
  );
}
