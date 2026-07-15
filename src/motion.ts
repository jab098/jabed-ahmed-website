import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const MOTION_EASE = 'power3.out'
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

let registered = false

export function registerMotion() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export function navigationEdgeScrollPosition() {
  const navHeight =
    document.querySelector<HTMLElement>('.site-nav')?.getBoundingClientRect().height ?? 0
  return `top ${Math.max(0, navHeight)}px`
}

export { gsap, ScrollTrigger }
