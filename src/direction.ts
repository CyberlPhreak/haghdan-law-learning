export type NavigationDirection = 'forward' | 'back';
export type DirectionalArrow = 'arrow-left' | 'arrow-right';
export type DirectionalChevron = 'chevron-left' | 'chevron-right';

export function resolveDirectionalArrow(direction: NavigationDirection, isRtl: boolean): DirectionalArrow {
  if (direction === 'forward') return isRtl ? 'arrow-left' : 'arrow-right';
  return isRtl ? 'arrow-right' : 'arrow-left';
}

export function resolveForwardChevron(isRtl: boolean): DirectionalChevron {
  return isRtl ? 'chevron-left' : 'chevron-right';
}
