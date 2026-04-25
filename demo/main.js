import React from 'react';
import { createRoot } from 'react-dom/client';
import { DialUpLoader, useDialUpSound } from '../dist/index.mjs';
import './styles.css';

const { StrictMode, useMemo, useState } = React;
const h = React.createElement;

function LabeledField(label, control, extraClassName) {
  return h(
    'label',
    { className: `field${extraClassName ? ` ${extraClassName}` : ''}` },
    h('span', null, label),
    control,
  );
}

function Toggle(label, checked, onChange) {
  return h(
    'label',
    { className: 'toggle' },
    h('input', {
      type: 'checkbox',
      checked,
      onChange: (event) => onChange(event.target.checked),
    }),
    h('span', null, label),
  );
}

function HookPreview() {
  const [enabled, setEnabled] = useState(true);
  const [speed, setSpeed] = useState(1);
  const { play, stop, isPlaying, stage, progress } = useDialUpSound({
    enabled,
    speed,
  });

  return h(
    'section',
    { className: 'panel' },
    h(
      'div',
      { className: 'panel__header' },
      h(
        'div',
        null,
        h('p', { className: 'eyebrow' }, 'Headless hook'),
        h('h2', null, 'useDialUpSound()'),
      ),
    ),
    h(
      'div',
      { className: 'hook-controls' },
      Toggle('Sound enabled', enabled, setEnabled),
      LabeledField(
        `Speed: ${speed.toFixed(2)}x`,
        h('input', {
          type: 'range',
          min: '0.5',
          max: '2',
          step: '0.05',
          value: speed,
          onChange: (event) => setSpeed(Number(event.target.value)),
        }),
      ),
    ),
    h(
      'div',
      { className: 'hook-buttons' },
      h(
        'button',
        {
          type: 'button',
          onClick: () => {
            void play();
          },
          disabled: isPlaying,
        },
        'Start sequence',
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: stop,
          disabled: !isPlaying && stage === 'idle',
        },
        'Stop',
      ),
    ),
    h(
      'dl',
      { className: 'stats' },
      h('div', null, h('dt', null, 'Stage'), h('dd', null, stage)),
      h('div', null, h('dt', null, 'Progress'), h('dd', null, `${Math.round(progress)}%`)),
      h('div', null, h('dt', null, 'Playing'), h('dd', null, isPlaying ? 'yes' : 'no')),
    ),
  );
}

function App() {
  const [sound, setSound] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [active, setActive] = useState(true);
  const [loop, setLoop] = useState(false);
  const [showModem, setShowModem] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showLeds, setShowLeds] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [size, setSize] = useState('md');
  const [speed, setSpeed] = useState(1);
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for connection...');

  const loaderKey = useMemo(
    () =>
      JSON.stringify({
        sound,
        autoPlay,
        active,
        loop,
        showModem,
        showProgress,
        showLeds,
        theme,
        size,
        speed,
      }),
    [active, autoPlay, loop, showLeds, showModem, showProgress, size, sound, speed, theme],
  );

  const toggles = [
    ['Sound', sound, setSound],
    [
      'Auto-play',
      autoPlay,
      (value) => {
        setAutoPlay(value);
        setStatusMessage('Waiting for connection...');
      },
    ],
    ['Active', active, setActive],
    ['Loop', loop, setLoop],
    ['Show modem', showModem, setShowModem],
    ['Show progress', showProgress, setShowProgress],
    ['Show LEDs', showLeds, setShowLeds],
  ];

  return h(
    'main',
    { className: 'page' },
    h(
      'section',
      { className: 'hero' },
      h('p', { className: 'eyebrow' }, 'dial-up-loader'),
      h('h1', null, 'Retro modem loading demo'),
      h(
        'p',
        { className: 'lead' },
        'Toggle props, test sound playback, and preview the headless hook in one page.',
      ),
      h(
        'p',
        { className: 'hint' },
        'Browsers may require a click before audio can start, even when auto-play is enabled.',
      ),
    ),
    h(
      'section',
      { className: 'layout' },
      h(
        'section',
        { className: 'panel' },
        h(
          'div',
          { className: 'panel__header' },
          h(
            'div',
            null,
            h('p', { className: 'eyebrow' }, 'Component preview'),
            h('h2', null, 'DialUpLoader'),
          ),
          h('span', { className: 'status-pill' }, statusMessage),
        ),
        h(
          'div',
          { className: 'preview' },
          h(DialUpLoader, {
            key: loaderKey,
            sound,
            autoPlay,
            active,
            loop,
            showModem,
            showProgress,
            showLeds,
            theme,
            size,
            speed,
            message: message || undefined,
            onConnect: () => setStatusMessage('Connected successfully.'),
            onStop: () => setStatusMessage('Playback stopped.'),
          }),
        ),
        h(
          'div',
          { className: 'control-grid' },
          LabeledField(
            'Theme',
            h(
              'select',
              { value: theme, onChange: (event) => setTheme(event.target.value) },
              h('option', { value: 'dark' }, 'dark'),
              h('option', { value: 'light' }, 'light'),
            ),
          ),
          LabeledField(
            'Size',
            h(
              'select',
              { value: size, onChange: (event) => setSize(event.target.value) },
              h('option', { value: 'sm' }, 'sm'),
              h('option', { value: 'md' }, 'md'),
              h('option', { value: 'lg' }, 'lg'),
            ),
          ),
          LabeledField(
            'Custom message',
            h('input', {
              type: 'text',
              placeholder: 'Optional status override',
              value: message,
              onChange: (event) => setMessage(event.target.value),
            }),
            'field--full',
          ),
          LabeledField(
            `Speed: ${speed.toFixed(2)}x`,
            h('input', {
              type: 'range',
              min: '0.5',
              max: '2',
              step: '0.05',
              value: speed,
              onChange: (event) => setSpeed(Number(event.target.value)),
            }),
            'field--full',
          ),
        ),
        h(
          'div',
          { className: 'toggles' },
          toggles.map(([label, checked, handler]) => Toggle(label, checked, handler)),
        ),
      ),
      h(HookPreview),
    ),
  );
}

createRoot(document.getElementById('root')).render(
  h(StrictMode, null, h(App)),
);
