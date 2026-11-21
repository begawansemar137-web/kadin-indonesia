import type { ReactElement, ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ScreenState = 'loading' | 'empty' | 'error' | 'ready';

export interface ScreenLayoutProps {
  state: ScreenState;
  errorMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
}

export function ScreenLayout({
  state,
  errorMessage = 'Terjadi kesalahan. Silakan coba lagi.',
  emptyMessage = 'Belum ada data untuk ditampilkan.',
  children,
}: ScreenLayoutProps): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      {state === 'loading' && (
        <View style={styles.centered} accessibilityLabel="Memuat data">
          <ActivityIndicator size="large" />
        </View>
      )}
      {state === 'error' && (
        <View style={styles.centered} accessibilityLabel={errorMessage}>
          <Text>{errorMessage}</Text>
        </View>
      )}
      {state === 'empty' && (
        <View style={styles.centered} accessibilityLabel={emptyMessage}>
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
});
