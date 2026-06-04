"use client"

import { type ReactNode } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"
import { Mail, Building2 } from "lucide-react"

export function ContactUsPopover({ children }: { children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger render={children} />
      <PopoverContent align="end" sideOffset={8}>
        <PopoverHeader>
          <PopoverTitle>Contact Us</PopoverTitle>
          <PopoverDescription>Need help? Reach out to our support team.</PopoverDescription>
        </PopoverHeader>
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium">Tejus Tech</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground">support@tejus.tech</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
