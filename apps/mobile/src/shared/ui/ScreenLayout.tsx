import type { ReactElement, ReactNode } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './colors';

export type ScreenState = 'loading' | 'empty' | 'error' | 'ready';

export interface ScreenLayoutProps {
  state: ScreenState;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function ScreenLayout({
  state,
  errorMessage = 'Terjadi kesalahan. Silakan coba lagi.',
  emptyMessage = 'Belum ada data untuk ditampilkan.',
  onRetry,
  children,
}: ScreenLayoutProps): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      {state === 'loading' && (
        // `accessible` + a role is required here: a plain View only becomes
        // an accessibility element (and announces its label) when explicitly
        // marked accessible — otherwise the loading state announces nothing.
        <View style={styles.centered} accessible accessibilityRole="progressbar" accessibilityLabel="Memuat data">
          <ActivityIndicator size="large" />
        </View>
      )}
      {state === 'error' && (
        <View style={styles.centered}>
          <Text>{errorMessage}</Text>
          {onRetry && (
            <Pressable onPress={onRetry} style={styles.retryButton} accessibilityRole="button">
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </Pressable>
          )}
        </View>
      )}
      {state === 'empty' && (
        <View style={styles.centered}>
          <Text>{emptyMessage}</Text>
        </View>
      )}
      {state === 'ready' && children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  retryButton: { marginTop: 16, padding: 12 },
  retryButtonText: { color: colors.linkText, fontWeight: '600', fontSize: 15 },
});
