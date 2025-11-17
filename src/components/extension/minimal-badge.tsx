import * as React from "react"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * MinimalBadge - Space-efficient badge for extension popup
 * Smaller padding and font size than default badge
 */
export interface MinimalBadgeProps extends BadgeProps {
  count?: number
}

export const MinimalBadge = React.forwardRef<HTMLDivElement, MinimalBadgeProps>(
  ({ count, children, className, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="minimal"
        className={cn("h-5 px-1.5 text-[10px] font-medium", className)}
        {...props}
      >
        {count !== undefined ? count : children}
      </Badge>
    )
  }
)

MinimalBadge.displayName = "MinimalBadge"
