import { useState, type ReactElement } from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import type { Article } from '../domain/types';
import { colors } from '../../../shared/ui/colors';

export interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ArticleCard({ article, onPress }: ArticleCardProps): ReactElement {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(article.imageUrl) && !imageFailed;
  const formattedDate = formatDate(article.publishedAt);
  // A Pressable groups its children into one accessibility element by
  // default, so a label on the inner image/fallback View would likely never
  // be announced. Put the full description on the Pressable itself instead.
  const accessibleLabel = `${article.title}, ${formattedDate}${hasImage ? '' : ', tanpa gambar'}`;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibleLabel} style={styles.card}>
      {hasImage ? (
        <Image
          testID="article-card-image"
          source={{ uri: article.imageUrl }}
          style={styles.image}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackText}>KADIN</Text>
        </View>
      )}
      <Text style={styles.title} accessibilityRole="header">
        {article.title}
      </Text>
      <Text style={styles.date}>{formattedDate}</Text>
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
    backgroundColor: colors.imageFallbackBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: { color: colors.mutedText, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: colors.mutedText, marginTop: 4 },
  summary: { fontSize: 14, color: '#444444', marginTop: 6 },
});
