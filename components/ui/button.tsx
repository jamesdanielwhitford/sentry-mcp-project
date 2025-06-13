// components/ui/button.tsx
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary" | "success" | "warning";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98]",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:scale-[0.98]",
      outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md active:scale-[0.98]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:scale-[0.98]",
      ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
      success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md active:scale-[0.98]",
      warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md active:scale-[0.98]"
    };

    const sizes = {
      default: "h-11 px-6 py-2.5 text-sm",
      sm: "h-9 px-4 py-2 text-sm",
      lg: "h-12 px-8 py-3 text-base",
      xl: "h-14 px-10 py-4 text-lg",
      icon: "h-10 w-10 p-0"
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && "cursor-not-allowed",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };