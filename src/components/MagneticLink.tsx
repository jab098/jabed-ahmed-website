import { useMagnetic } from '../hooks'

/* Thin wrapper so any anchor can opt into the magnetic pull without each
   call site re-wiring useMagnetic by hand */
export function MagneticLink({
  className,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) {
  const { ref } = useMagnetic()
  return (
    <a ref={ref} className={className} {...rest}>
      {children}
    </a>
  )
}
