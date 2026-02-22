import * as React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "text-slate-700 border border-slate-300 bg-white/90",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
