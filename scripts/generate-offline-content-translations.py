"""Generate static legal-content language packs using locally installed Argos models."""
from __future__ import annotations

import json
import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

BATCH_SIZE = 24
LANGUAGES = ("en", "zh", "ar", "es")


def translate_language(source: list[str], from_code: str, to_code: str, cache_dir: str) -> tuple[str, list[str]]:
    from argostranslate import translate

    cache_path = Path(cache_dir) / f"{from_code}-{to_code}.json"
    translated: list[str | None] = [None] * len(source)
    if cache_path.exists():
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
        if len(cached) == len(source):
            translated = cached

    pending = [index for index, value in enumerate(translated) if not value]
    total_batches = (len(pending) + BATCH_SIZE - 1) // BATCH_SIZE
    started = time.time()
    for batch_number in range(total_batches):
        indices = pending[batch_number * BATCH_SIZE : (batch_number + 1) * BATCH_SIZE]
        combined = "\n\n".join(source[index] for index in indices)
        parts = translate.translate(combined, from_code, to_code).split("\n\n")
        if len(parts) != len(indices):
            parts = [translate.translate(source[index], from_code, to_code) for index in indices]
        for index, value in zip(indices, parts):
            translated[index] = value.strip()
        if (batch_number + 1) % 8 == 0 or batch_number + 1 == total_batches:
            cache_path.write_text(json.dumps(translated, ensure_ascii=False), encoding="utf-8")
            elapsed = round(time.time() - started)
            print(f"{from_code}->{to_code}: {batch_number + 1}/{total_batches} batches ({elapsed}s)", flush=True)
    return to_code, [value or source[index] for index, value in enumerate(translated)]


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python generate-offline-content-translations.py <source.json> <output.json>")
    source_path, output_path = map(Path, sys.argv[1:])
    source = json.loads(source_path.read_text(encoding="utf-8"))
    cache_dir = Path(os.getenv("HAGHDAN_TRANSLATION_CACHE", Path(os.getenv("TEMP", ".")) / "haghdan-content-translation-cache"))
    cache_dir.mkdir(parents=True, exist_ok=True)

    _, english = translate_language(source, "fa", "en", str(cache_dir))
    translations: dict[str, list[str]] = {"en": english}
    with ProcessPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(translate_language, english, "en", language, str(cache_dir)) for language in ("zh", "ar", "es")]
        for future in as_completed(futures):
            language, values = future.result()
            translations[language] = values

    output = {
        "status": "draft-offline-machine-translation-requires-legal-editorial-review",
        "sourceLanguage": "fa",
        "stringCount": len(source),
        "source": source,
        "translations": {language: translations[language] for language in LANGUAGES},
    }
    output_path.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {output_path} with {len(source)} source strings in {len(LANGUAGES)} languages.", flush=True)


if __name__ == "__main__":
    main()
