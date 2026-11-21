import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { ServiceDetailScreen } from '../../features/services/screens/ServiceDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceDetail'>;

export function ServiceDetailRoute({ route }: Props): ReactElement {
  return <ServiceDetailScreen serviceId={route.params.serviceId} />;
}
