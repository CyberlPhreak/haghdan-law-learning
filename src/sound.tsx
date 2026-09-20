import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { useLearner } from './store';

type SoundFeedback = {
  playTap: () => void;
  previewTap: () => void;
  playCorrect: () => void;
  playIncorrect: () => void;
  playMilestone: () => void;
};

const silentFeedback: SoundFeedback = {
  playTap: () => undefined,
  previewTap: () => undefined,
  playCorrect: () => undefined,
  playIncorrect: () => undefined,
  playMilestone: () => undefined,
};

const SoundContext = createContext<SoundFeedback>(silentFeedback);

export function SoundProvider({ children }: { children: ReactNode }) {
  const { state } = useLearner();
  const tapPlayer = useAudioPlayer(require('../assets/sounds/tap.wav'), { keepAudioSessionActive: true });
  const correctPlayer = useAudioPlayer(require('../assets/sounds/correct-clap.wav'), { keepAudioSessionActive: true });
  const correctAccentPlayer = useAudioPlayer(require('../assets/sounds/tap.wav'), { keepAudioSessionActive: true });
  const incorrectPlayer = useAudioPlayer(require('../assets/sounds/incorrect.wav'), { keepAudioSessionActive: true });
  const milestonePlayer = useAudioPlayer(require('../assets/sounds/correct-clap.wav'), { keepAudioSessionActive: true });
  const milestoneAccentFirst = useAudioPlayer(require('../assets/sounds/tap.wav'), { keepAudioSessionActive: true });
  const milestoneAccentSecond = useAudioPlayer(require('../assets/sounds/tap.wav'), { keepAudioSessionActive: true });
  const lastTapAt = useRef(0);

  useEffect(() => {
    void setAudioModeAsync({
      interruptionMode: 'mixWithOthers',
      // Feedback cues must remain audible on iPhones whose ring switch is muted.
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(() => undefined);
    tapPlayer.volume = 0.42;
    correctPlayer.volume = 0.86;
    correctAccentPlayer.volume = 0.34;
    incorrectPlayer.volume = 0.68;
    milestonePlayer.volume = 0.92;
    milestoneAccentFirst.volume = 0.4;
    milestoneAccentSecond.volume = 0.32;
  }, [correctAccentPlayer, correctPlayer, incorrectPlayer, milestoneAccentFirst, milestoneAccentSecond, milestonePlayer, tapPlayer]);

  const replay = useCallback((player: AudioPlayer, force = false) => {
    if (!force && !state.soundEffectsEnabled) return;
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
    previewTap: () => replay(tapPlayer, true),
    playCorrect: () => {
      replay(correctPlayer);
      setTimeout(() => replay(correctAccentPlayer), 105);
    },
    playIncorrect: () => replay(incorrectPlayer),
    playMilestone: () => {
      replay(milestonePlayer);
      setTimeout(() => replay(milestoneAccentFirst), 150);
      setTimeout(() => replay(milestoneAccentSecond), 330);
    },
  }), [correctAccentPlayer, correctPlayer, incorrectPlayer, milestoneAccentFirst, milestoneAccentSecond, milestonePlayer, replay, tapPlayer]);

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
