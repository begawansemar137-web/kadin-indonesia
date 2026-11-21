import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { NewsDetailScreen } from '../../features/news/screens/NewsDetailScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsDetail'>;

export function NewsDetailRoute({ route }: Props): ReactElement {
  return <NewsDetailScreen articleId={route.params.articleId} />;
}
