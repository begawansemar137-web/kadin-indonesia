import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { ServiceListScreen } from '../../features/services/screens/ServiceListScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceList'>;

export function ServiceListRoute({ navigation }: Props): ReactElement {
  return (
    <ServiceListScreen
      onSelectService={(serviceId) => navigation.navigate('ServiceDetail', { serviceId })}
    />
  );
}
