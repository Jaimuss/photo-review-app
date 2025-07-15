import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { LecorralLogo } from "@/components/lecorral-logo"

interface LecorralHeaderProps {
  showModeToggle?: boolean
  children?: React.ReactNode
  className?: string
}

export function LecorralHeader({ showModeToggle = true, children, className = "" }: LecorralHeaderProps) {
  return (
    <header className={`bg-background border-b sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <LecorralLogo size="md" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">LECORRAL PICKER</h1>
              <p className="text-sm text-muted-foreground">Selección Profesional</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {children}
            {showModeToggle && <ModeToggle />}
          </div>
        </div>
      </div>
    </header>
  )
} 