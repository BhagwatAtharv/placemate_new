"use client";

import * as React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const RadioGroupContext = React.createContext({ value: undefined, onValueChange: undefined });

const RadioGroup = React.forwardRef(({ className, value, onValueChange, ...props }, ref) => (
  <RadioGroupContext.Provider value={{ value, onValueChange }}>
    <div ref={ref} className={cn("grid gap-2", className)} {...props} />
  </RadioGroupContext.Provider>
));
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isChecked}
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-gray-300 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked && "border-blue-600",
        className
      )}
    >
      {isChecked && (
        <span className="flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        </span>
      )}
    </button>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
