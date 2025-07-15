import Image from 'next/image'

interface LecorralLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LecorralLogo({ size = 'md', className = '' }: LecorralLogoProps) {
  const sizes = {
    sm: 24,
    md: 40,
    lg: 60
  }
  
  const currentSize = sizes[size]

  return (
    <Image
      src="/lecorral-logo.png"
      alt="LECORRAL"
      width={currentSize}
      height={currentSize}
      className={`object-contain ${className}`}
      priority
    />
  )
} 