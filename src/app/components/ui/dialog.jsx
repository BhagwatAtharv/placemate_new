"use client";

import * as React from "react";
import { X } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DialogContext = React.createContext(undefined);

const Dialog = ({ open = false, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef(({ children, asChild, onClick, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within Dialog");

  const handleClick = (e) => {
    onClick?.(e);
    context.onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");

  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
<<<<<<< HEAD
        className="fixed inset-0 bg-slate-900/28"
=======
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
        onClick={() => context.onOpenChange(false)}
      />
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 py-8">
        <div
          ref={ref}
          className={cn(
<<<<<<< HEAD
            "relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.35)]",
=======
            "relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6",
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          <button
            onClick={() => context.onOpenChange(false)}
<<<<<<< HEAD
            className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };
