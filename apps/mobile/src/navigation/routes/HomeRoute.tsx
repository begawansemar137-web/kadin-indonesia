import type { ReactElement } from 'react';
import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { WelcomeScreen } from '../../features/shell/screens/WelcomeScreen';
import { colors } from '../../shared/ui/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface FeatureCardProps {
  title: string;
  description: string;
  accessibilityLabel: string;
  onPress: () => void;
}

function FeatureCard({ title, description, accessibilityLabel, onPress }: FeatureCardProps): ReactElement {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={styles.card}>
      <View style={styles.cardTextGroup}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Text style={styles.cardChevron}>{'›'}</Text>
    </Pressable>
  );
}

export function HomeRoute({ navigation }: Props): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <WelcomeScreen />
      <View style={styles.cardList}>
        <FeatureCard
          title="Berita"
          description="Lihat berita dan informasi terbaru dari KADIN Indonesia."
          accessibilityLabel="Berita. Lihat berita dan informasi terbaru dari KADIN Indonesia."
          onPress={() => navigation.navigate('NewsList')}
        />
        <FeatureCard
          title="Layanan"
          description="Jelajahi layanan yang tersedia untuk anggota KADIN Indonesia."
          accessibilityLabel="Layanan. Jelajahi layanan yang tersedia untuk anggota KADIN Indonesia."
          onPress={() => navigation.navigate('ServiceList')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 24 },
  cardList: { paddingHorizontal: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
  },
  cardTextGroup: { flex: 1, paddingRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDescription: { fontSize: 13, color: colors.mutedText, marginTop: 4 },
  cardChevron: { fontSize: 20, color: colors.linkText, fontWeight: '600' },
});
