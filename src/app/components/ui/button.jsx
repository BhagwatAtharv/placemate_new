import * as React from "react";

// Simple cn function inline to avoid import issues
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_12px_28px_-16px_rgba(49,75,212,0.9)] hover:-translate-y-0.5 hover:brightness-105",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-slate-300/80 bg-white/90 text-slate-700 hover:bg-slate-50 hover:border-slate-400",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-lg px-3",
    lg: "h-11 rounded-xl px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
