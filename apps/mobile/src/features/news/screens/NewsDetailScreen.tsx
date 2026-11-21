import { useEffect, useState, type ReactElement } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { FixtureNewsRepository } from '../data/fixtureNewsRepository';
import type { Article } from '../domain/types';
import type { NewsRepository } from '../data/newsRepository';

// Module-scope singleton — see NewsListScreen.tsx for why an inline default
// parameter here would re-create the repository every render and loop.
const defaultNewsRepository = new FixtureNewsRepository();

export interface NewsDetailScreenProps {
  articleId: string;
  repository?: NewsRepository;
}

export function NewsDetailScreen({
  articleId,
  repository = defaultNewsRepository,
}: NewsDetailScreenProps): ReactElement {
  const [article, setArticle] = useState<Article | null>(null);
  const [state, setState] = useState<ScreenState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .getById(articleId)
      .then((result) => {
        if (cancelled) return;
        setArticle(result);
        setState(result ? 'ready' : 'empty');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [articleId, repository, reloadToken]);

  return (
    <ScreenLayout
      state={state}
      errorMessage="Gagal memuat artikel. Silakan coba lagi."
      emptyMessage="Artikel tidak ditemukan atau belum dipublikasikan."
      onRetry={() => setReloadToken((t) => t + 1)}
    >
      {article && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title} accessibilityRole="header">
            {article.title}
          </Text>
          <Text style={styles.body}>{article.body}</Text>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22 },
});
