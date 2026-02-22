"use client";

import * as React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-500 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
