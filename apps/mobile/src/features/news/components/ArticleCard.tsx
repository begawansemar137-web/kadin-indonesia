import type { ReactElement } from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import type { Article } from '../domain/types';

export interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ArticleCard({ article, onPress }: ArticleCardProps): ReactElement {
  const hasImage = Boolean(article.imageUrl);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
      {hasImage ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          accessibilityLabel={`Gambar untuk artikel ${article.title}`}
        />
      ) : (
        <View style={styles.imageFallback} accessibilityLabel={`Tidak ada gambar untuk artikel ${article.title}`}>
          <Text style={styles.imageFallbackText}>KADIN</Text>
        </View>
      )}
      <Text style={styles.title} accessibilityRole="header">
        {article.title}
      </Text>
      <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
      <Text style={styles.summary} numberOfLines={2}>
        {article.summary}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  image: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  imageFallback: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: { color: '#999999', fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#777777', marginTop: 4 },
  summary: { fontSize: 14, color: '#444444', marginTop: 6 },
});
