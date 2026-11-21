import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['http://localhost:19006'],
  config: {
    screens: {
      Home: '',
      NewsList: 'news',
      NewsDetail: 'news/:articleId',
      ServiceList: 'services',
      ServiceDetail: 'services/:serviceId',
    },
  },
};
