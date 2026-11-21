import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppShellProps {
  children: ReactNode;
}

interface AppShellState {
  hasError: boolean;
}

export class AppShell extends Component<AppShellProps, AppShellState> {
  state: AppShellState = { hasError: false };

  static getDerivedStateFromError(): AppShellState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Seam for a future crash-reporting integration (e.g. Sentry) — for now,
    // at minimum the error and component stack must not be lost silently.
    console.error('[AppShell] uncaught error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View
          style={styles.errorContainer}
          accessibilityLabel="Terjadi kesalahan pada aplikasi"
        >
          <Text>Terjadi kesalahan. Silakan muat ulang aplikasi.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
