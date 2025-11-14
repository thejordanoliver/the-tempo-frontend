declare module 'react-native-video' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  type VideoProps = ViewProps & {
    source: { uri: string };
    resizeMode?: 'cover' | 'contain' | 'stretch';
    controls?: boolean;
    paused?: boolean;
    repeat?: boolean;
    style?: any;
  };

  export default class Video extends Component<VideoProps> {}
}
