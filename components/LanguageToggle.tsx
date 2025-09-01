"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const pathname = usePathname()
  
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/en${pathname}`}>🇬🇧 EN</Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/ru${pathname}`}>🇷🇺 RU</Link>
      </Button>
      <Globe className="w-5 h-5 text-muted-foreground" />
    </div>
  )
}
