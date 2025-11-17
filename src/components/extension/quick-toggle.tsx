import * as React from "react"
import { Switch, SwitchProps } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * QuickToggle - Instant feedback toggle for extension popup
 * Includes label and optional description in compact layout
 */
export interface QuickToggleProps extends Omit<SwitchProps, 'id'> {
  label: string
  description?: string
  id: string
}

export const QuickToggle = React.forwardRef<HTMLButtonElement, QuickToggleProps>(
  ({ label, description, id, className, ...props }, ref) => {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 space-y-0.5">
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch
          ref={ref}
          id={id}
          className={cn("data-[state=checked]:bg-primary", className)}
          {...props}
        />
      </div>
    )
  }
)

QuickToggle.displayName = "QuickToggle"
