import { useEffect, useState, type ReactElement } from 'react';
import { FlatList } from 'react-native';
import { ScreenLayout, type ScreenState } from '../../../shared/ui/ScreenLayout';
import { ServiceCard } from '../components/ServiceCard';
import { FixtureServiceRepository } from '../data/fixtureServiceRepository';
import type { Service } from '../domain/types';
import type { ServiceRepository } from '../data/serviceRepository';

const PAGE_SIZE = 10;

// Module-scope singleton — an inline default parameter here would
// re-create the repository every render and loop on the no-prop path
// production uses (see WP-02a's NewsListScreen for the original bug).
const defaultServiceRepository = new FixtureServiceRepository();

export interface ServiceListScreenProps {
  repository?: ServiceRepository;
  onSelectService?: (serviceId: string) => void;
}

export function ServiceListScreen({
  repository = defaultServiceRepository,
  onSelectService,
}: ServiceListScreenProps): ReactElement {
  const [services, setServices] = useState<Service[]>([]);
  const [state, setState] = useState<ScreenState>('loading');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    repository
      .list({ limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setServices(result.data);
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
      errorMessage="Gagal memuat layanan. Silakan coba lagi."
      onRetry={() => setReloadToken((t) => t + 1)}
    >
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard service={item} onPress={() => onSelectService?.(item.id)} />}
      />
    </ScreenLayout>
  );
}
