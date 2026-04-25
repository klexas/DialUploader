import React, { useCallback, useEffect, useRef } from 'react';
import type { ConnectionStage, DialUpLoaderProps } from './types';
import { useDialUpSound } from './useDialUpSound';
import { injectStyles } from './utils/styles';

const STAGE_MESSAGES: Record<ConnectionStage, string> = {
  idle: 'Ready to connect…',
  dialing: 'Dialing ISP…',
  ringing: 'Waiting for answer…',
  negotiating: 'Negotiating connection…',
  connected: 'CONNECTED at 56 Kbps!',
  error: 'Connection failed.',
};

const SIZE_MAP = {
  sm: { font: '10px', modem: 'sm' as const },
  md: { font: '12px', modem: 'md' as const },
  lg: { font: '14px', modem: 'lg' as const },
};

const MODEM_ART_SM = ['┌─────────┐', '│ ● MODEM │', '│ ■ □ □ ■ │', '└─────────┘'].join('\n');

const MODEM_ART_MD = [
  '╔═══════════════╗',
  '║   ● MODEM     ║',
  '║               ║',
  '║  PWR ●    CD  ║',
  '║  TX  ●    RX  ║',
  '╚═══════════════╝',
].join('\n');

function buildBar(pct: number, width = 20): string {
  const n = Math.round((pct / 100) * width);
  return `[${'█'.repeat(n)}${'░'.repeat(width - n)}]`;
}

export const DialUpLoader: React.FC<DialUpLoaderProps> = ({
  sound = true,
  autoPlay = false,
  message,
  size = 'md',
  theme = 'dark',
  className,
  style,
  speed = 1,
  active = true,
  onConnect,
  onStop,
  loop = false,
  showModem = true,
  showProgress = true,
  showLeds = true,
  'aria-label': ariaLabel,
}) => {
  const loopRef = useRef(loop);
  const onStopRef = useRef(onStop);
  loopRef.current = loop;
  onStopRef.current = onStop;

  const playRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const handleComplete = useCallback(() => {
    onConnect?.();
    if (loopRef.current) {
      setTimeout(() => {
        void playRef.current?.();
      }, 400);
    }
  }, [onConnect]);

  const { play, stop, isPlaying, stage, progress } = useDialUpSound({
    enabled: sound,
    speed,
    onComplete: handleComplete,
  });

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    if (active && autoPlay) {
      void play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      onStopRef.current?.();
    }
  }, [active, stop]);

  const dark = theme === 'dark';
  const sz = SIZE_MAP[size];
  const fg = dark ? '#33ff33' : '#006600';
  const bg = dark ? '#0d0d0d' : '#f0f0f0';
  const modemArt = sz.modem === 'sm' ? MODEM_ART_SM : MODEM_ART_MD;
  const msg = message ?? STAGE_MESSAGES[stage];

  const ledPwr = active;
  const ledCD = stage === 'negotiating' || stage === 'connected';
  const ledTX = stage === 'dialing' || stage === 'negotiating';
  const ledRX = stage === 'ringing' || stage === 'negotiating' || stage === 'connected';

  const root: React.CSSProperties = {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: sz.font,
    lineHeight: 1.45,
    backgroundColor: bg,
    color: fg,
    border: `1px solid ${fg}`,
    borderRadius: 4,
    padding: 16,
    display: 'inline-block',
    userSelect: 'none',
    minWidth: 180,
    boxSizing: 'border-box',
    ...style,
  };

  const ledCls = (on: boolean, colour: string, blink?: string) =>
    `_dul-led-${on ? colour : 'off'}${on && blink ? ` ${blink}` : ''}`;

  return (
    <div
      className={`dial-up-loader${className ? ` ${className}` : ''}`}
      style={root}
      role="status"
      aria-label={ariaLabel ?? `Loading: ${msg}`}
      aria-live="polite"
      aria-busy={active && stage !== 'connected'}
    >
      {showModem && (
        <pre style={{ margin: 0, fontSize: 'inherit', lineHeight: 1.3 }} aria-hidden="true">
          {modemArt}
        </pre>
      )}

      {showLeds && (
        <div
          style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4 }}
          aria-hidden="true"
        >
          <span className={ledCls(ledPwr, 'g')}>PWR</span>
          <span className={ledCls(ledCD, 'y', '_dul-blink')}>CD</span>
          <span className={ledCls(ledTX, 'r', '_dul-blink-f')}>TX</span>
          <span className={ledCls(ledRX, 'r', '_dul-blink-f')}>RX</span>
        </div>
      )}

      <div style={{ marginTop: 6, minHeight: '1.4em' }}>
        <span aria-hidden="true">&gt; </span>
        {msg}
        {isPlaying && (
          <span className="_dul-blink" aria-hidden="true">
            _
          </span>
        )}
      </div>

      {showProgress && (
        <div style={{ marginTop: 4 }} aria-hidden="true">
          {buildBar(progress)} {Math.round(progress)}%
        </div>
      )}

      {!autoPlay && !isPlaying && active && stage !== 'connected' && (
        <button
          className="_dul-btn"
          onClick={() => {
            void play();
          }}
          style={{
            marginTop: 8,
            background: 'transparent',
            border: `1px solid ${fg}`,
            color: fg,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            padding: '3px 8px',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
          }}
        >
          [ CONNECT ]
        </button>
      )}
    </div>
  );
};

DialUpLoader.displayName = 'DialUpLoader';

export default DialUpLoader;
