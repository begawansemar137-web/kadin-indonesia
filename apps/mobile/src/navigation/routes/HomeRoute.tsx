import type { ReactElement } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { WelcomeScreen } from '../../features/shell/screens/WelcomeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeRoute(_props: Props): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeScreen />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
});
