import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { useLearner } from './store';

type SoundFeedback = {
  playTap: () => void;
  playCorrect: () => void;
  playIncorrect: () => void;
};

const silentFeedback: SoundFeedback = {
  playTap: () => undefined,
  playCorrect: () => undefined,
  playIncorrect: () => undefined,
};

const SoundContext = createContext<SoundFeedback>(silentFeedback);

export function SoundProvider({ children }: { children: ReactNode }) {
  const { state } = useLearner();
  const tapPlayer = useAudioPlayer(require('../assets/sounds/tap.wav'), { keepAudioSessionActive: true });
  const correctPlayer = useAudioPlayer(require('../assets/sounds/correct-clap.wav'), { keepAudioSessionActive: true });
  const incorrectPlayer = useAudioPlayer(require('../assets/sounds/incorrect.wav'), { keepAudioSessionActive: true });
  const lastTapAt = useRef(0);

  useEffect(() => {
    void setAudioModeAsync({
      interruptionMode: 'mixWithOthers',
      playsInSilentMode: false,
      shouldPlayInBackground: false,
    }).catch(() => undefined);
    tapPlayer.volume = 0.32;
    correctPlayer.volume = 0.72;
    incorrectPlayer.volume = 0.5;
  }, [correctPlayer, incorrectPlayer, tapPlayer]);

  const replay = useCallback((player: AudioPlayer) => {
    if (!state.soundEffectsEnabled) return;
    try {
      void player.seekTo(0).catch(() => undefined);
      player.play();
    } catch {
      // Audio feedback must never block learning or navigation.
    }
  }, [state.soundEffectsEnabled]);

  const value = useMemo<SoundFeedback>(() => ({
    playTap: () => {
      const now = Date.now();
      if (now - lastTapAt.current < 45) return;
      lastTapAt.current = now;
      replay(tapPlayer);
    },
    playCorrect: () => replay(correctPlayer),
    playIncorrect: () => replay(incorrectPlayer),
  }), [correctPlayer, incorrectPlayer, replay, tapPlayer]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export const useSoundFeedback = () => useContext(SoundContext);

export function SoundPressable({ onPress, sound = true, disabled, ...props }: PressableProps & { sound?: boolean }) {
  const { playTap } = useSoundFeedback();
  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={(event) => {
        if (sound && !disabled) playTap();
        onPress?.(event);
      }}
    />
  );
}