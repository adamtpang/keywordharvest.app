import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * CompactButton - Optimized for 400px popup width
 * Smaller padding, optimized for dense layouts
 */
export interface CompactButtonProps extends ButtonProps {
  icon?: React.ReactNode
}

export const CompactButton = React.forwardRef<HTMLButtonElement, CompactButtonProps>(
  ({ icon, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="compact"
        className={cn("gap-1.5", className)}
        {...props}
      >
        {icon && <span className="w-3 h-3">{icon}</span>}
        {children}
      </Button>
    )
  }
)

CompactButton.displayName = "CompactButton"
