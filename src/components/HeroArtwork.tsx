import { useRef } from 'react'
import { useMobileArtworkExit } from '../useMobileArtworkExit'
import { SignalField } from './SignalField'

export function HeroArtwork({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const opacity = useMobileArtworkExit(rootRef)
  const hidden = opacity === 0
  return <div ref={rootRef} className="hero-artwork">
    <div className="hero-artwork__exit" style={{ opacity, visibility: hidden ? 'hidden' : 'visible' }} aria-hidden={hidden || undefined} inert={hidden}>
      <SignalField active={active && !hidden} />
    </div>
  </div>
}
