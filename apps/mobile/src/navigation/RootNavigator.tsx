import type { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeRoute } from './routes/HomeRoute';
import { NewsListRoute } from './routes/NewsListRoute';
import { NewsDetailRoute } from './routes/NewsDetailRoute';

export type RootStackParamList = {
  Home: undefined;
  NewsList: undefined;
  NewsDetail: { articleId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'KADIN Indonesia' }}>
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerTitle: 'KADIN Indonesia' }} />
      <Stack.Screen name="NewsList" component={NewsListRoute} options={{ headerTitle: 'Berita' }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailRoute} options={{ headerTitle: 'Detail Berita' }} />
    </Stack.Navigator>
  );
}
