import type { ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../RootNavigator';
import { NewsListScreen } from '../../features/news/screens/NewsListScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsList'>;

export function NewsListRoute({ navigation }: Props): ReactElement {
  return (
    <NewsListScreen
      onSelectArticle={(articleId) => navigation.navigate('NewsDetail', { articleId })}
    />
  );
}
