import { useEffect, useState, type ReactElement } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { FixtureServiceRepository } from '../data/fixtureServiceRepository';
import type { Service } from '../domain/types';
import type { ServiceRepository } from '../data/serviceRepository';
import { colors } from '../../../shared/ui/colors';

const defaultServiceRepository = new FixtureServiceRepository();

export interface ServiceDetailScreenProps {
  serviceId: string;
  repository?: ServiceRepository;
}

export function ServiceDetailScreen({
  serviceId,
  repository = defaultServiceRepository,
}: ServiceDetailScreenProps): ReactElement {
  const [service, setService] = useState<Service | null>(null);
  const [state, setState] = useState<ScreenState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .getById(serviceId)
      .then((result) => {
        if (cancelled) return;
        setService(result);
        setState(result ? 'ready' : 'empty');
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, repository, reloadToken]);

  const isActive = service?.status === 'active';

  return (
    <ScreenLayout
      state={state}
      errorMessage="Gagal memuat layanan. Silakan coba lagi."
      emptyMessage="Layanan tidak ditemukan."
      onRetry={() => setReloadToken((t) => t + 1)}
    >
      {service && (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title} accessibilityRole="header">
            {service.title}
          </Text>
          {!isActive && <Text style={styles.unavailableBadge}>Tidak tersedia</Text>}
          <Text style={styles.description}>{service.description}</Text>
          <Text style={styles.eligibility}>Syarat: {service.eligibilitySummary}</Text>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  unavailableBadge: { fontSize: 13, color: colors.dangerText, fontWeight: '600', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  eligibility: { fontSize: 13, color: colors.mutedText },
});
