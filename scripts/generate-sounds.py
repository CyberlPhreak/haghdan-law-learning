"""Generate HaghDan's original, dependency-free PCM feedback sound set."""

from __future__ import annotations

import math
import random
import struct
import wave
from io import BytesIO
from pathlib import Path

SAMPLE_RATE = 44_100
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "sounds"


def buffer(seconds: float) -> list[float]:
    return [0.0] * int(seconds * SAMPLE_RATE)


def add_tone(samples: list[float], start: float, duration: float, frequency: float, amplitude: float, *, end_frequency: float | None = None, brightness: float = 0.12) -> None:
    first = int(start * SAMPLE_RATE)
    count = min(int(duration * SAMPLE_RATE), len(samples) - first)
    phase = 0.0
    for index in range(max(0, count)):
        time = index / SAMPLE_RATE
        progress = index / max(1, count - 1)
        current_frequency = frequency + ((end_frequency or frequency) - frequency) * progress
        phase += 2 * math.pi * current_frequency / SAMPLE_RATE
        attack = min(1.0, time / 0.008)
        release = math.exp(-4.7 * progress)
        envelope = attack * release
        value = math.sin(phase) + brightness * math.sin(phase * 2.01) + brightness * 0.35 * math.sin(phase * 3.02)
        samples[first + index] += value * amplitude * envelope


def add_clap(samples: list[float], start: float, duration: float, amplitude: float, seed: int) -> None:
    generator = random.Random(seed)
    first = int(start * SAMPLE_RATE)
    count = min(int(duration * SAMPLE_RATE), len(samples) - first)
    low_pass = 0.0
    previous = 0.0
    for index in range(max(0, count)):
        progress = index / max(1, count - 1)
        noise = generator.uniform(-1.0, 1.0)
        low_pass += 0.16 * (noise - low_pass)
        high_pass = noise - low_pass
        shaped = high_pass - previous * 0.18
        previous = high_pass
        attack = min(1.0, index / (SAMPLE_RATE * 0.0025))
        envelope = attack * math.exp(-7.5 * progress)
        flutter = 0.72 + 0.28 * math.sin(progress * math.pi * 13) ** 2
        samples[first + index] += shaped * amplitude * envelope * flutter


def write_wav(name: str, samples: list[float], target_peak: float = 0.84) -> None:
    peak = max(abs(value) for value in samples) or 1.0
    scale = target_peak / peak
    fade = int(SAMPLE_RATE * 0.012)
    pcm: list[bytes] = []
    for index, value in enumerate(samples):
        edge = min(1.0, index / max(1, fade), (len(samples) - 1 - index) / max(1, fade))
        integer = round(max(-1.0, min(1.0, value * scale * edge)) * 32767)
        pcm.append(struct.pack("<h", integer))
    payload = BytesIO()
    with wave.open(payload, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(SAMPLE_RATE)
        audio.writeframes(b"".join(pcm))
    (OUTPUT / name).write_bytes(payload.getvalue())


def make_tap() -> list[float]:
    samples = buffer(0.115)
    add_tone(samples, 0.0, 0.075, 1_420, 0.52, end_frequency=1_080, brightness=0.18)
    add_tone(samples, 0.008, 0.08, 710, 0.16, brightness=0.08)
    add_clap(samples, 0.0, 0.025, 0.09, 11)
    return samples


def make_correct() -> list[float]:
    samples = buffer(0.92)
    for start, frequency, amplitude in [(0.02, 523.25, 0.28), (0.13, 659.25, 0.27), (0.24, 783.99, 0.25), (0.36, 1_046.50, 0.22)]:
        add_tone(samples, start, 0.48, frequency, amplitude, brightness=0.13)
    add_clap(samples, 0.04, 0.18, 0.24, 23)
    add_clap(samples, 0.19, 0.17, 0.20, 29)
    add_clap(samples, 0.35, 0.16, 0.16, 31)
    add_tone(samples, 0.42, 0.42, 1_568, 0.09, end_frequency=1_760, brightness=0.04)
    return samples


def make_incorrect() -> list[float]:
    samples = buffer(0.52)
    add_tone(samples, 0.02, 0.28, 349.23, 0.34, end_frequency=293.66, brightness=0.08)
    add_tone(samples, 0.20, 0.29, 293.66, 0.30, end_frequency=246.94, brightness=0.06)
    add_tone(samples, 0.05, 0.37, 174.61, 0.08, end_frequency=146.83, brightness=0.02)
    return samples


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    write_wav("tap.wav", make_tap(), 0.72)
    write_wav("correct-clap.wav", make_correct(), 0.84)
    write_wav("incorrect.wav", make_incorrect(), 0.68)
    print("Generated tap, correct, and incorrect cues. Milestones are layered in app playback.")
