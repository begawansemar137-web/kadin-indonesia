import type { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeRoute } from './routes/HomeRoute';

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerTitle: 'KADIN Indonesia' }}>
      <Stack.Screen name="Home" component={HomeRoute} options={{ headerTitle: 'KADIN Indonesia' }} />
    </Stack.Navigator>
  );
}
