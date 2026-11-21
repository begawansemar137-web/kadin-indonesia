import type { ReactElement } from 'react';
import { AppShell } from './src/shared/ui/AppShell';
import { WelcomeScreen } from './src/features/shell/screens/WelcomeScreen';

export default function App(): ReactElement {
  return (
    <AppShell>
      <WelcomeScreen />
    </AppShell>
  );
}
