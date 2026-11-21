import type { ReactElement } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import type { Service } from '../domain/types';
import { colors } from '../../../shared/ui/colors';

export interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export function ServiceCard({ service, onPress }: ServiceCardProps): ReactElement {
  const isActive = service.status === 'active';
  // Composite label on the Pressable itself — a label on a child inside it
  // would be swallowed by the Pressable's default accessibility grouping
  // (see WP-02a's ArticleCard fix for the same issue).
  const accessibleLabel = `${service.title}${isActive ? '' : ', tidak tersedia'}`;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibleLabel} style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {service.title}
      </Text>
      {!isActive && <Text style={styles.unavailableBadge}>Tidak tersedia</Text>}
      <Text style={styles.description}>{service.description}</Text>
      <Text style={styles.eligibility}>{service.eligibilitySummary}</Text>
      <Text style={styles.cta}>{isActive ? 'Lihat detail layanan' : 'Lihat status layanan'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 16, fontWeight: '600' },
  unavailableBadge: { fontSize: 12, color: colors.dangerText, fontWeight: '600', marginTop: 4 },
  description: { fontSize: 14, color: '#444444', marginTop: 6 },
  eligibility: { fontSize: 12, color: colors.mutedText, marginTop: 6 },
  cta: { fontSize: 14, color: colors.linkText, fontWeight: '600', marginTop: 10 },
});
