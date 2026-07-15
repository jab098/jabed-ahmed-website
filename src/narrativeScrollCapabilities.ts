export const TOUCH_FIRST_INPUT_QUERY = '(hover: none) and (pointer: coarse)'

export function shouldUseNativeTouchScrolling(
  maxTouchPoints = navigator.maxTouchPoints,
  touchFirstPrimaryInput = window.matchMedia(TOUCH_FIRST_INPUT_QUERY).matches,
) {
  return maxTouchPoints > 0 && touchFirstPrimaryInput
}
