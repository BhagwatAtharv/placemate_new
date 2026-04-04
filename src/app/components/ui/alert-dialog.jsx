"use client";

import * as React from "react";

import { Button } from "./button";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
<<<<<<< HEAD
        className="fixed inset-0 bg-slate-900/28"
=======
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
        onClick={() => onOpenChange?.(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
<<<<<<< HEAD
      "relative w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_28px_70px_-40px_rgba(15,23,42,0.35)]",
=======
      "relative bg-white rounded-lg shadow-xl max-w-md w-full p-6",
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />
);

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex justify-end space-x-2 mt-6", className)}
    {...props}
  />
);

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <Button ref={ref} variant="outline" className={className} {...props} />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <Button ref={ref} className={className} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
