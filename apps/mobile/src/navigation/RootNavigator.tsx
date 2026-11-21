import type { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeRoute } from './routes/HomeRoute';
import { NewsListRoute } from './routes/NewsListRoute';
import { NewsDetailRoute } from './routes/NewsDetailRoute';
import { ServiceListRoute } from './routes/ServiceListRoute';
import { ServiceDetailRoute } from './routes/ServiceDetailRoute';

export type RootStackParamList = {
  Home: undefined;
  NewsList: undefined;
  NewsDetail: { articleId: string };
  ServiceList: undefined;
  ServiceDetail: { serviceId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'KADIN Indonesia' }}>
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerTitle: 'KADIN Indonesia' }} />
      <Stack.Screen name="NewsList" component={NewsListRoute} options={{ headerTitle: 'Berita' }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailRoute} options={{ headerTitle: 'Detail Berita' }} />
      <Stack.Screen name="ServiceList" component={ServiceListRoute} options={{ headerTitle: 'Layanan' }} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailRoute} options={{ headerTitle: 'Detail Layanan' }} />
    </Stack.Navigator>
  );
}
