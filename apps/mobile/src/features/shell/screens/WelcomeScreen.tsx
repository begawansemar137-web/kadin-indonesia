import type { ReactElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function WelcomeScreen(): ReactElement {
  return (
    <View
      style={styles.container}
      accessibilityLabel="Halaman selamat datang KADIN Indonesia"
    >
      <Text style={styles.heading}>Selamat datang di KADIN Indonesia</Text>
      <Text style={styles.status}>
        Status: tahap pengembangan awal (WP-01 shell) — fitur identitas, membership,
        dan QR belum aktif.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginTop: 12,
  },
});
