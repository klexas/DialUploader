import type { CSSProperties } from 'react';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderTheme = 'dark' | 'light';
export type ConnectionStage =
  | 'idle'
  | 'dialing'
  | 'ringing'
  | 'negotiating'
  | 'connected'
  | 'error';

export interface DialUpLoaderProps {
  sound?: boolean;
  autoPlay?: boolean;
  message?: string;
  size?: LoaderSize;
  theme?: LoaderTheme;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  active?: boolean;
  onConnect?: () => void;
  onStop?: () => void;
  loop?: boolean;
  showModem?: boolean;
  showProgress?: boolean;
  showLeds?: boolean;
  'aria-label'?: string;
}

export interface UseDialUpSoundOptions {
  enabled?: boolean;
  speed?: number;
  onComplete?: () => void;
}

export interface UseDialUpSoundReturn {
  play: () => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  stage: ConnectionStage;
  progress: number;
}
