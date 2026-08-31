export const SIGNAL_LAYERS = 7

/** Seven open signal sheets: an abstract data sculpture, never a plotted metric. */
export function getSignalPoint(u: number, v: number, time: number, formation: number) {
  const slice = Math.min(v * SIGNAL_LAYERS, SIGNAL_LAYERS - 0.000001)
  const layer = Math.floor(slice) - 3
  const across = (u - 0.5) * 2
  const along = ((slice % 1) - 0.5) * 2
  const separation = 0.21 + Math.sin(time * 0.45) * 0.025
  let x: number
  let y: number
  let z: number

  if (formation === 1) {
    // Alternating planes form a woven, spatial data lattice.
    const bend = Math.sin(across * Math.PI + time * 0.4) * 0.08
    x = layer % 2 === 0 ? across * 0.8 : layer * separation + bend
    y = along * 0.65
    z = layer % 2 === 0 ? layer * separation + bend : across * 0.8
  } else if (formation === 2) {
    // Parallel ribbons carry signals through an open, twisting stream.
    x = across * 0.9
    y = along * 0.16 + layer * 0.13 + Math.sin(across * 2 + time * 0.4) * 0.18
    z = layer * 0.12 + Math.cos(across * 2 + layer * 0.3 + time * 0.3) * 0.2
  } else {
    // Tapered square layers make a faceted crystal with a filled centre.
    const extent = 0.85 - Math.abs(layer) * 0.13
    const shear = Math.sin(time * 0.35) * layer * 0.025
    x = across * extent + shear
    y = along * extent
    z = layer * separation
  }

  // Keep every formation inside the shared camera envelope as it rotates.
  x *= 0.9
  y *= 0.9
  z *= 0.9

  const turn = time * 0.16 + 0.45
  const tilt = 0.5 + Math.sin(time * 0.12) * 0.16
  const roll = -0.25 + Math.sin(time * 0.09) * 0.12
  const turnedX = x * Math.cos(turn) + z * Math.sin(turn)
  const turnedZ = -x * Math.sin(turn) + z * Math.cos(turn)
  const tiltedY = y * Math.cos(tilt) - turnedZ * Math.sin(tilt)
  const depth = y * Math.sin(tilt) + turnedZ * Math.cos(tilt)
  const perspective = 1 / (2 - depth * 0.32)
  return {
    x: (turnedX * Math.cos(roll) - tiltedY * Math.sin(roll)) * perspective,
    y: (turnedX * Math.sin(roll) + tiltedY * Math.cos(roll)) * perspective,
    depth,
  }
}
