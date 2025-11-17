import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * PopupCard - Optimized card for 400px popup width
 * No horizontal padding on outer container, content spacing only
 */
export interface PopupCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export const PopupCard = React.forwardRef<HTMLDivElement, PopupCardProps>(
  ({ title, description, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="p-3 pb-2">
            {title && (
              <h3 className="text-sm font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-3 pt-0">{children}</div>
      </div>
    )
  }
)

PopupCard.displayName = "PopupCard"
