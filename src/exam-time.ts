/** Wall-clock deadlines keep a backgrounded browser/phone from extending a test. */
export function remainingExamSeconds(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function elapsedExamSeconds(duration: number, remaining: number) {
  return Math.min(duration, Math.max(0, duration - remaining));
}
