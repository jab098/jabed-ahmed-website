/* The site's brand glyph — a chunky extruded "J": a ghosted depth layer
   offset up-left behind the solid front face gives the 3D block look.
   Drawn in currentColor so each context sets the tone; the favicon mirrors
   this shape in brand green on the dark tile. */
const J_PATH =
  'M208 40 V152 A56 56 0 0 1 152 208 H116 A56 56 0 0 1 60 152 V120 H112 V152 A4 4 0 0 0 116 156 H152 A4 4 0 0 0 156 152 V40 Z'

export function LogoMark({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d={J_PATH} transform="translate(-16 -16)" fill="currentColor" opacity="0.35" />
      <path d={J_PATH} fill="currentColor" />
    </svg>
  )
}
