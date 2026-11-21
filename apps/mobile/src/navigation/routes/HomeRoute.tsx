import type { ReactElement } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { WelcomeScreen } from '../../features/shell/screens/WelcomeScreen';
import { colors } from '../../shared/ui/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeRoute({ navigation }: Props): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeScreen />
      <Pressable onPress={() => navigation.navigate('NewsList')} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Lihat Berita</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('ServiceList')} style={styles.link} accessibilityRole="button">
        <Text style={styles.linkText}>Lihat Layanan</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  link: { padding: 16, alignItems: 'center' },
  linkText: { fontSize: 16, color: colors.linkText, fontWeight: '600' },
});
