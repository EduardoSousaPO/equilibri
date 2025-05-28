"use client"

import { type ForwardRefRenderFunction, forwardRef } from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps {
  className?: string;
  value?: number;
}

const ProgressComponent: ForwardRefRenderFunction<HTMLDivElement, ProgressProps> = 
  ({ className, value, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );

const Progress = forwardRef(ProgressComponent);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress } 