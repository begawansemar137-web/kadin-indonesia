import type { ReactElement } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../../shared/ui/colors';

// Logo-KADIN.png is 1448x1086 (white background, no transparency) —
// fixed height preserves its aspect ratio at the rendered width.
const LOGO_WIDTH = 180;
const LOGO_HEIGHT = LOGO_WIDTH * (1086 / 1448);

// kadin-verse-lockup.png is 580x80, cropped from the Kadin Verse portal
// mockup's header — same aspect-ratio-preserving approach as the crest.
const LOCKUP_WIDTH = 200;
const LOCKUP_HEIGHT = LOCKUP_WIDTH * (80 / 580);

export function WelcomeScreen(): ReactElement {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/Logo-KADIN.png')}
        style={styles.logo}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="Logo KADIN Indonesia"
      />
      <Image
        source={require('../../../../assets/kadin-verse-lockup.png')}
        style={styles.lockup}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="Kadin Verse, Portal Digital Dunia Usaha Indonesia"
      />
      <Text style={styles.heading} accessibilityRole="header">
        Selamat datang di KADIN Indonesia
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          Status: tahap pengembangan awal (WP-01 shell) — fitur identitas, membership,
          dan QR belum aktif.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    marginBottom: 16,
  },
  lockup: {
    width: LOCKUP_WIDTH,
    height: LOCKUP_HEIGHT,
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.imageFallbackBackground,
  },
  badgeText: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
  },
});
